import { create } from 'zustand';
import {
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import type { Node, Edge, Connection, EdgeChange, NodeChange } from '@xyflow/react';

interface Snapshot {
    nodes: Node[];
    edges: Edge[];
}

interface CircuitState {
    nodes: Node[];
    edges: Edge[];
    // Undo/redo history
    past: Snapshot[];
    future: Snapshot[];
    /** ID of the most recently selected node */
    lastSelectedNodeId: string | null;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    addNode: (node: Node) => void;
    updateNodeData: (nodeId: string, dataPatch: Record<string, any>) => void;
    updateEdgeData: (edgeId: string, dataPatch: Record<string, any>) => void;
    lastSelectedEdgeId: string | null;
    flipHorizontal: () => void;
    flipVertical: () => void;
    clearAll: () => void;
    undo: () => void;
    redo: () => void;
    /** Replace the whole circuit (load file / example). Undoable. */
    loadProject: (nodes: Node[], edges: Edge[]) => void;
    /** Copy the selected nodes (and wires between them) to the internal clipboard */
    copySelection: () => number;
    /** Paste the clipboard, offset from the originals, and select the pasted nodes */
    paste: () => number;
    /** ID of the ECU currently being edited in the Rules Editor */
    editingECUId: string | null;
    setEditingECU: (id: string | null) => void;
    /** Save current state to history before a destructive action */
    pushHistory: () => void;
}

const MAX_HISTORY = 50;

/** Deep-clone node/edge data so later mutations can't leak into history */
function snapshot(nodes: Node[], edges: Edge[]): Snapshot {
    return {
        nodes: nodes.map(n => ({ ...n, data: structuredClone(n.data) })),
        edges: edges.map(e => ({ ...e, data: structuredClone(e.data || {}) })),
    };
}

/** History stack with the current circuit appended (bounded) */
function withSnapshot(past: Snapshot[], nodes: Node[], edges: Edge[]): Snapshot[] {
    const next = [...past, snapshot(nodes, edges)];
    if (next.length > MAX_HISTORY) next.shift();
    return next;
}

let clipboard: Snapshot | null = null;
let pasteCount = 0;

const useStore = create<CircuitState>((set, get) => ({
    nodes: [],
    edges: [],
    past: [],
    future: [],
    lastSelectedNodeId: null,
    lastSelectedEdgeId: null,
    editingECUId: null,

    setEditingECU: (id) => set({ editingECUId: id }),

    pushHistory: () => {
        const { nodes, edges, past } = get();
        set({ past: withSnapshot(past, nodes, edges), future: [] });
    },

    undo: () => {
        const { past, future, nodes, edges } = get();
        if (past.length === 0) return;
        const prev = past[past.length - 1];
        set({
            nodes: prev.nodes,
            edges: prev.edges,
            past: past.slice(0, -1),
            future: [snapshot(nodes, edges), ...future],
        });
    },

    redo: () => {
        const { past, future, nodes, edges } = get();
        if (future.length === 0) return;
        const next = future[0];
        set({
            nodes: next.nodes,
            edges: next.edges,
            future: future.slice(1),
            past: [...past, snapshot(nodes, edges)],
        });
    },

    loadProject: (nodes, edges) => {
        const state = get();
        set({
            nodes,
            edges,
            past: withSnapshot(state.past, state.nodes, state.edges),
            future: [],
            lastSelectedNodeId: null,
            lastSelectedEdgeId: null,
            editingECUId: null,
        });
    },

    copySelection: () => {
        const { nodes, edges } = get();
        const selected = nodes.filter(n => n.selected);
        if (selected.length === 0) return 0;
        const ids = new Set(selected.map(n => n.id));
        clipboard = snapshot(selected, edges.filter(e => ids.has(e.source) && ids.has(e.target)));
        pasteCount = 0;
        return selected.length;
    },

    paste: () => {
        if (!clipboard || clipboard.nodes.length === 0) return 0;
        const { nodes, edges, past } = get();
        pasteCount++;
        const offset = 40 * pasteCount;

        // Allocate fresh numeric IDs above the current maximum
        let maxId = 0;
        for (const n of nodes) {
            const num = parseInt(n.id, 10);
            if (!isNaN(num) && num > maxId) maxId = num;
        }
        const idMap = new Map<string, string>();
        for (const n of clipboard.nodes) idMap.set(n.id, String(++maxId));

        const newNodes: Node[] = clipboard.nodes.map(n => {
            const id = idMap.get(n.id)!;
            const data = structuredClone(n.data) as Record<string, any>;
            return {
                ...n,
                id,
                selected: true,
                position: { x: n.position.x + offset, y: n.position.y + offset },
                data: { ...data, id },
            };
        });
        const stamp = Date.now();
        const newEdges: Edge[] = clipboard.edges.map((e, i) => ({
            ...e,
            id: `e-paste-${stamp}-${i}`,
            source: idMap.get(e.source)!,
            target: idMap.get(e.target)!,
            selected: false,
            data: structuredClone(e.data || {}),
        }));

        set({
            nodes: [...nodes.map(n => (n.selected ? { ...n, selected: false } : n)), ...newNodes],
            edges: [...edges, ...newEdges],
            past: withSnapshot(past, nodes, edges),
            future: [],
        });
        return newNodes.length;
    },

    onNodesChange: (changes) => {
        // Push history for add/remove operations (not position drags — those are too frequent)
        const hasStructuralChange = changes.some(c => c.type === 'remove' || c.type === 'add');

        // Track the most recently selected node
        const selectChange = changes.find(c => c.type === 'select' && c.selected) as { id: string } | undefined;

        const { nodes, edges, past } = get();
        const updates: Partial<CircuitState> = { nodes: applyNodeChanges(changes, nodes) };
        if (hasStructuralChange) {
            updates.past = withSnapshot(past, nodes, edges);
            updates.future = [];
        }
        if (selectChange) {
            updates.lastSelectedNodeId = selectChange.id;
        }
        set(updates);
    },
    onEdgesChange: (changes) => {
        const hasStructuralChange = changes.some(c => c.type === 'remove' || c.type === 'add');
        const { nodes, edges, past } = get();
        const updates: Partial<CircuitState> = { edges: applyEdgeChanges(changes, edges) };
        if (hasStructuralChange) {
            updates.past = withSnapshot(past, nodes, edges);
            updates.future = [];
        }
        // Track selected edge
        const edgeSelectChange = changes.find(c => c.type === 'select' && c.selected) as { id: string } | undefined;
        if (edgeSelectChange) {
            updates.lastSelectedEdgeId = edgeSelectChange.id;
        }
        set(updates);
    },
    onConnect: (connection) => {
        const { nodes, edges, past } = get();
        const newEdge = {
            ...connection,
            id: `e-${connection.source}-${connection.sourceHandle ?? 'src'}-${connection.target}-${connection.targetHandle ?? 'tgt'}-${Date.now()}`,
            type: 'wire',
            data: { resistance: 0.001 },
        };

        set({
            edges: [...edges, newEdge],
            past: withSnapshot(past, nodes, edges),
            future: [],
        });
    },
    addNode: (node) => {
        const { nodes, edges, past } = get();
        set({
            nodes: [...nodes, node],
            past: withSnapshot(past, nodes, edges),
            future: [],
        });
    },
    updateNodeData: (nodeId, dataPatch) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    const oldData = node.data as any;
                    return {
                        ...node,
                        data: {
                            ...oldData,
                            ...dataPatch,
                            state: { ...(oldData.state || {}), ...(dataPatch.state || {}) },
                            params: { ...(oldData.params || {}), ...(dataPatch.params || {}) },
                        },
                    };
                }
                return node;
            }),
        });
    },
    updateEdgeData: (edgeId, dataPatch) => {
        set({
            edges: get().edges.map((edge) => {
                if (edge.id === edgeId) {
                    const oldData = (edge.data || {}) as any;
                    return {
                        ...edge,
                        data: { ...oldData, ...dataPatch },
                    };
                }
                return edge;
            }),
        });
    },
    flipHorizontal: () => {
        const { nodes, edges, past } = get();
        if (!nodes.some(n => n.selected)) return;
        set({
            nodes: nodes.map((node) => node.selected
                ? { ...node, data: { ...node.data, flipX: !(node.data as any).flipX } }
                : node),
            past: withSnapshot(past, nodes, edges),
            future: [],
        });
    },
    flipVertical: () => {
        const { nodes, edges, past } = get();
        if (!nodes.some(n => n.selected)) return;
        set({
            nodes: nodes.map((node) => node.selected
                ? { ...node, data: { ...node.data, flipY: !(node.data as any).flipY } }
                : node),
            past: withSnapshot(past, nodes, edges),
            future: [],
        });
    },
    clearAll: () => {
        const { nodes, edges, past } = get();
        set({ nodes: [], edges: [], past: withSnapshot(past, nodes, edges), future: [] });
    },
}));

export default useStore;
