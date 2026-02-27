import { useState, useCallback, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Palette } from './components/Palette';
import { CircuitCanvas } from './components/CircuitCanvas';
import { Inspector } from './components/Inspector';
import { SimConsole } from './components/SimConsole';
import type { LogEntry } from './components/SimConsole';
import { Toolbar } from './components/Toolbar';
import useStore from './store/useStore';
import { solveCircuit } from './simulation/solver';
import { autoLayout } from './utils/autoLayout';
import { exportToPdf } from './utils/export';

function App() {
  const [simState, setSimState] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const time = new Date().toLocaleTimeString('en-AU', { hour12: false });
    setLogs(prev => [...prev, { time, level, message }]);
  }, []);

  const runOnce = useCallback(() => {
    const state = useStore.getState();
    const result = solveCircuit(state.nodes as any, state.edges as any);

    // Apply results back to store
    if (result.nodeUpdates.length > 0) {
      for (const update of result.nodeUpdates) {
        state.updateNodeData(update.id, update.data);
      }
    }

    // Apply edge coloring and data (voltage)
    if (result.edgeUpdates.length > 0) {
      const newEdges = state.edges.map(e => {
        const update = result.edgeUpdates.find(u => u.id === e.id);
        if (update) {
          return {
            ...e,
            style: update.style,
            animated: update.animated,
            data: { ...(e.data || {}), ...(update.data || {}) }
          };
        }
        return e;
      });
      useStore.setState({ edges: newEdges });
    }

    // Log events
    for (const event of result.events) {
      addLog(event.level, event.message);
    }
  }, [addLog]);

  const onRun = useCallback(() => {
    setSimState('running');
    addLog('info', 'Simulation RUNNING');
    runOnce();
    intervalRef.current = setInterval(runOnce, 200);
  }, [addLog, runOnce]);

  const onPause = useCallback(() => {
    setSimState('paused');
    addLog('info', 'Simulation PAUSED');
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [addLog]);

  const onStep = useCallback(() => {
    setSimState('paused');
    addLog('info', 'Simulation STEP');
    runOnce();
  }, [addLog, runOnce]);

  const onReset = useCallback(() => {
    setSimState('stopped');
    if (intervalRef.current) clearInterval(intervalRef.current);
    addLog('info', 'Simulation RESET');
    // Reset all stateful component data
    const state = useStore.getState();
    for (const node of state.nodes) {
      const d = node.data as any;
      if (d.type === 'fuse') {
        state.updateNodeData(node.id, { state: { blown: false } } as any);
      }
      if (d.type === 'relay_spdt') {
        state.updateNodeData(node.id, { state: { energized: false } } as any);
      }
      if (d.type === 'lamp') {
        state.updateNodeData(node.id, { state: { on: false } } as any);
      }
    }
    // Reset edge styles
    useStore.setState({
      edges: state.edges.map(e => ({ ...e, style: undefined, animated: false })),
    });
  }, [addLog]);

  const onSave = useCallback(() => {
    const state = useStore.getState();
    const project = {
      version: 1,
      nodes: state.nodes,
      edges: state.edges,
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit-project.json';
    a.click();
    URL.revokeObjectURL(url);
    addLog('info', 'Project saved to circuit-project.json');
  }, [addLog]);

  const onLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const project = JSON.parse(ev.target?.result as string);
          useStore.setState({ nodes: project.nodes, edges: project.edges });
          addLog('info', `Loaded project with ${project.nodes.length} components`);
        } catch {
          addLog('error', 'Failed to parse project file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addLog]);

  const onExport = useCallback(async () => {
    addLog('info', 'Generating PDF Export...');
    try {
      await exportToPdf('circuit-schematic');
      addLog('info', 'PDF Export successful');
    } catch (err) {
      addLog('error', `PDF Export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [addLog]);

  const onRotate = useCallback(() => {
    useStore.getState().rotateSelected();
  }, []);

  const onClearAll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimState('stopped');
    useStore.getState().clearAll();
    setLogs([]);
    addLog('info', 'Canvas cleared');
  }, [addLog]);

  // Consolidating keyboard shortcuts to CircuitCanvas

  const onAutoLayout = useCallback(() => {
    const state = useStore.getState();
    const layoutedNodes = autoLayout(state.nodes, state.edges, 'TB');
    useStore.setState({ nodes: layoutedNodes });
    addLog('info', 'Auto layout applied');
  }, [addLog]);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans">
        {/* Left Palette */}
        <Palette />

        {/* Center Canvas + Toolbar + Console */}
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
          <Toolbar
            simState={simState}
            onRun={onRun}
            onPause={onPause}
            onStep={onStep}
            onReset={onReset}
            onSave={onSave}
            onLoad={onLoad}
            onExport={onExport}
            onRotate={onRotate}
            onClearAll={onClearAll}
            onAutoLayout={onAutoLayout}
          />
          <CircuitCanvas />
          <SimConsole logs={logs} />
        </div>

        {/* Right Inspector */}
        <Inspector />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
