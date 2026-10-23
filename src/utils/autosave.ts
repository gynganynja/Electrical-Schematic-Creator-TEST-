import type { Node, Edge } from '@xyflow/react';
import useStore from '../store/useStore';

const STORAGE_KEY = 'circuit-generator:autosave';
const SAVE_INTERVAL_MS = 1500;

interface SavedProject {
    version: 1;
    nodes: Node[];
    edges: Edge[];
}

/** Read the last autosaved circuit, if any. */
export function loadAutosave(): SavedProject | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const project = JSON.parse(raw);
        if (!Array.isArray(project?.nodes) || !Array.isArray(project?.edges) || project.nodes.length === 0) return null;
        return project;
    } catch {
        return null;
    }
}

/**
 * Save the circuit to localStorage whenever it changes, at most once per
 * SAVE_INTERVAL_MS (the sim updates the store every tick). Returns an unsubscribe.
 */
export function startAutosave(): () => void {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const save = () => {
        timer = null;
        const { nodes, edges } = useStore.getState();
        try {
            if (nodes.length === 0) localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, nodes, edges } satisfies SavedProject));
        } catch {
            // Storage full or unavailable (private mode) — autosave is best-effort
        }
    };

    const unsubscribe = useStore.subscribe((state, prev) => {
        if (state.nodes === prev.nodes && state.edges === prev.edges) return;
        if (!timer) timer = setTimeout(save, SAVE_INTERVAL_MS);
    });

    return () => {
        unsubscribe();
        if (timer) {
            clearTimeout(timer);
            save();
        }
    };
}
