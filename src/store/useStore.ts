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
    /** ID of the ECU currently being edited in the Rules Editor */
    editingECUId: string | null;
    setEditingECU: (id: string | null) => void;
    /** Save current state to history before a destructive action */
    pushHistory: () => void;
}

const MAX_HISTORY = 50;

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
        // Safe deep clone for history snapshots
        const snapshot = {
            nodes: nodes.map(n => ({ ...n, data: JSON.parse(JSON.stringify(n.data)) })),
            edges: edges.map(e => ({ ...e, data: JSON.parse(JSON.stringify(e.data || {})) }))
        };
        const newPast = [...past, snapshot];
        if (newPast.length > MAX_HISTORY) newPast.shift();
        set({ past: newPast, future: [] });
    },

    undo: () => {
        const { past, nodes, edges } = get();
        if (past.length === 0) return;
        const prev = past[past.length - 1];
        const newPast = past.slice(0, -1);

        // Save current for future
        const current = {
            nodes: nodes.map(n => ({ ...n, data: JSON.parse(JSON.stringify(n.data)) })),
            edges: edges.map(e => ({ ...e, data: JSON.parse(JSON.stringify(e.data || {})) }))
        };

        set({
            nodes: prev.nodes,
            edges: prev.edges,
            past: newPast,
            future: [current, ...get().future],
        });
    },

    redo: () => {
        const { future, nodes, edges } = get();
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        const current = {
            nodes: nodes.map(n => ({ ...n, data: JSON.parse(JSON.stringify(n.data)) })),
            edges: edges.map(e => ({ ...e, data: JSON.parse(JSON.stringify(e.data || {})) }))
        };

        set({
            nodes: next.nodes,
            edges: next.edges,
            future: newFuture,
            past: [...get().past, current],
        });
    },

    onNodesChange: (changes) => {
        // Push history for add/remove operations (not position drags — those are too frequent)
        const hasStructuralChange = changes.some(c => c.type === 'remove' || c.type === 'add');

        // Track the most recently selected node
        const selectChange = changes.find(c => c.type === 'select' && (c as any).selected === true) as any;

        const { nodes, edges, past } = get();
        const newNodes = applyNodeChanges(changes, nodes);

        const updates: Partial<CircuitState> = { nodes: newNodes };
        if (hasStructuralChange) {
            const snapshot = {
                nodes: nodes.map(n => ({ ...n, data: JSON.parse(JSON.stringify(n.data)) })),
                edges: edges.map(e => ({ ...e, data: JSON.parse(JSON.stringify(e.data || {})) }))
            };
            const newPast = [...past, snapshot];
            if (newPast.length > MAX_HISTORY) newPast.shift();
            updates.past = newPast;
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
        const newEdges = applyEdgeChanges(changes, edges);
        const updates: Partial<CircuitState> = { edges: newEdges };
        if (hasStructuralChange) {
            const snapshot = {
                nodes: nodes.map(n => ({ ...n, data: JSON.parse(JSON.stringify(n.data)) })),
                edges: edges.map(e => ({ ...e, data: JSON.parse(JSON.stringify(e.data || {})) }))
            };
            const newPast = [...past, snapshot];
            if (newPast.length > MAX_HISTORY) newPast.shift();
            updates.past = newPast;
            updates.future = [];
        }
        // Track selected edge
        const edgeSelectChange = changes.find(c => c.type === 'select' && (c as any).selected === true) as any;
        if (edgeSelectChange) {
            updates.lastSelectedEdgeId = edgeSelectChange.id;
        }
        set(updates);
    },
    onConnect: (connection) => {
        const { nodes, edges, past } = get();
        const snapshot = {
            nodes: nodes.map(n => ({ ...n, data: JSON.parse(JSON.stringify(n.data)) })),
            edges: edges.map(e => ({ ...e, data: JSON.parse(JSON.stringify(e.data || {})) }))
        };
        const newPast = [...past, snapshot];
        if (newPast.length > MAX_HISTORY) newPast.shift();

        const newEdge = {
            ...connection,
            id: `e-${connection.source}-${connection.sourceHandle ?? 'src'}-${connection.target}-${connection.targetHandle ?? 'tgt'}-${Date.now()}`,
            type: 'wire',
            data: { resistance: 0.001 },
        };

        set({
            edges: [...edges, newEdge],
            past: newPast,
            future: [],
        });
    },
    addNode: (node) => {
        const { nodes, edges, past } = get();
        const newPast = [...past, { nodes: structuredClone(nodes), edges: structuredClone(edges) }];
        if (newPast.length > MAX_HISTORY) newPast.shift();
        set({
            nodes: [...nodes, node],
            past: newPast,
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
        const hasSelected = nodes.some(n => n.selected);
        if (!hasSelected) return;

        const snapshot = {
            nodes: nodes.map(n => ({ ...n, data: JSON.parse(JSON.stringify(n.data)) })),
            edges: edges.map(e => ({ ...e, data: JSON.parse(JSON.stringify(e.data || {})) }))
        };
        const newPast = [...past, snapshot];
        if (newPast.length > MAX_HISTORY) newPast.shift();

        set({
            nodes: nodes.map((node) => {
                if (node.selected) {
                    const oldData = node.data as any;
                    return {
                        ...node,
                        data: {
                            ...oldData,
                            flipX: !oldData.flipX,
                        },
                    };
                }
                return node;
            }),
            past: newPast,
            future: [],
        });
    },
    flipVertical: () => {
        const { nodes, edges, past } = get();
        const hasSelected = nodes.some(n => n.selected);
        if (!hasSelected) return;

        const snapshot = {
            nodes: nodes.map(n => ({ ...n, data: JSON.parse(JSON.stringify(n.data)) })),
            edges: edges.map(e => ({ ...e, data: JSON.parse(JSON.stringify(e.data || {})) }))
        };
        const newPast = [...past, snapshot];
        if (newPast.length > MAX_HISTORY) newPast.shift();

        set({
            nodes: nodes.map((node) => {
                if (node.selected) {
                    const oldData = node.data as any;
                    return {
                        ...node,
                        data: {
                            ...oldData,
                            flipY: !oldData.flipY,
                        },
                    };
                }
                return node;
            }),
            past: newPast,
            future: [],
        });
    },
    clearAll: () => {
        const { nodes, edges, past } = get();
        const newPast = [...past, { nodes: structuredClone(nodes), edges: structuredClone(edges) }];
        if (newPast.length > MAX_HISTORY) newPast.shift();
        set({ nodes: [], edges: [], past: newPast, future: [] });
    },
}));

export default useStore;
