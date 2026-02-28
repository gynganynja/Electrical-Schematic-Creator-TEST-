import { useState, useCallback, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Palette } from './components/Palette';
import { CircuitCanvas } from './components/CircuitCanvas';
import { Inspector } from './components/Inspector';
import { SimConsole } from './components/SimConsole';
import type { LogEntry } from './components/SimConsole';
import { Toolbar } from './components/Toolbar';
import useStore from './store/useStore';
import type { Node as RFNode } from '@xyflow/react';
import { solveCircuit } from './simulation/solver';
import { autoLayout } from './utils/autoLayout';
import { exportToPdf } from './utils/export';
import { globalCANScheduler, CANScheduler } from './simulation/can/CANScheduler';
import type { CANFrame } from './simulation/can/types';
import { FaultInjectionPanel } from './components/tools/FaultInjectionPanel';
import { LogicRuntime } from './simulation/ecu/LogicRuntime';
import { RulesEditor } from './components/tools/RulesEditor';

const globalLogicRuntime = new LogicRuntime();

// Expose store globally so export.ts can read frame nodes without a circular import
(window as any).__circuitStore = useStore;

function App() {
  const [simState, setSimState] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [canLogs, setCanLogs] = useState<CANFrame[]>([]);
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

    // ---- CAN Registration and ECU Logic Processing ----
    const advEcus = state.nodes.filter((n: RFNode) => (n.data as any).type === 'ecu_advanced');
    const canBuses = state.nodes.filter((n: RFNode) => (n.data as any).type === 'can_bus');
    const transceivers = state.nodes.filter((n: RFNode) => (n.data as any).type === 'can_transceiver');

    // 1a. Unify electrically-connected CAN bus nodes into logical bus groups
    //     using Union-Find on their CAN_H nets so daisy-chained buses share frames.
    const ufParent: Record<string, string> = {};
    const ufFind = (x: string): string => {
      if (!ufParent[x]) ufParent[x] = x;
      if (ufParent[x] !== x) ufParent[x] = ufFind(ufParent[x]);
      return ufParent[x];
    };
    const ufUnion = (a: string, b: string) => { ufParent[ufFind(a)] = ufFind(b); };

    // Collect all CAN_H nets each bus touches
    const busCanHNetsMap = new Map<string, string[]>();
    for (const bus of canBuses) {
      const nets = [
        result.netMap[`${bus.id}:can_h_l`],
        result.netMap[`${bus.id}:can_h_r`]
      ].filter(Boolean) as string[];
      busCanHNetsMap.set(bus.id, nets);
      // Union all nets this bus touches
      for (let i = 1; i < nets.length; i++) ufUnion(nets[0], nets[i]);
    }
    // Union buses that share a net
    const netToBuses = new Map<string, string[]>();
    for (const bus of canBuses) {
      for (const net of busCanHNetsMap.get(bus.id) || []) {
        const root = ufFind(net);
        if (!netToBuses.has(root)) netToBuses.set(root, []);
        netToBuses.get(root)!.push(bus.id);
      }
    }
    // Build busId -> logicalBusId (use first bus id in group as canonical)
    const busToLogical = new Map<string, string>();
    for (const members of netToBuses.values()) {
      const canonical = members[0];
      for (const m of members) busToLogical.set(m, canonical);
    }
    // Collect all CAN_H nets per logical bus
    const logicalBusNets = new Map<string, Set<string>>();
    for (const bus of canBuses) {
      const logical = busToLogical.get(bus.id) || bus.id;
      if (!logicalBusNets.has(logical)) logicalBusNets.set(logical, new Set());
      for (const net of busCanHNetsMap.get(bus.id) || []) {
        logicalBusNets.get(logical)!.add(ufFind(net));
      }
    }

    // 1b. Map ECUs to their logical CAN bus
    const ecuToBusMap = new Map<string, string>(); // ECU ID -> logical Bus ID

    for (const ecu of advEcus) {
      const ecuTxdNet = result.netMap[`${ecu.id}:txd`];
      if (!ecuTxdNet) continue;

      const connectedTransceiver = transceivers.find((t: RFNode) => result.netMap[`${t.id}:txd`] === ecuTxdNet);
      if (!connectedTransceiver) continue;

      const transceiverCanHNet = result.netMap[`${connectedTransceiver.id}:can_h`];
      if (!transceiverCanHNet) continue;
      const tRoot = ufFind(transceiverCanHNet);

      for (const [logical, netRoots] of logicalBusNets.entries()) {
        if (netRoots.has(tRoot)) {
          ecuToBusMap.set(ecu.id, logical);
          break;
        }
      }
    }

    // 2. Execute Logic for ALL Advanced ECUs independently
    for (const ecu of advEcus) {
      const d = ecu.data as any;
      const busId = ecuToBusMap.get(ecu.id);
      const bus = busId ? state.nodes.find(n => n.id === busId) : null;
      const isPowered = d.state?.vcc > 10;
      if (!isPowered) continue;

      // --- Custom Logic Execution ---
      const logicRules = Array.isArray(d.params?.rules) ? d.params.rules : [];
      const logicInputs: Record<string, number> = {};

      // Use same floating-net fallback as the solver: unconnected pins get a __floating_ net name
      const pinNet = (nodeId: string, handle: string) => {
        const h = handle.toLowerCase();
        return result.netMap[`${nodeId}:${h}`] || `__floating_${nodeId}_${h}`;
      };

      const ecuGndVoltage = result.nodeVoltages[pinNet(ecu.id, 'gnd')] ?? 0;

      (Array.isArray(d.params?.inputs) ? d.params.inputs : ['in1', 'in2']).forEach((name: string) => {
        const net = pinNet(ecu.id, name);
        const absVoltage = result.nodeVoltages[net] ?? 0;
        logicInputs[name] = absVoltage - ecuGndVoltage; // Must be relative to ECU Ground
      });

      const rxFrames = bus ? ((bus.data as any).state?.lastFrames || []) : [];
      const logicResult = globalLogicRuntime.execute(logicInputs, logicRules, Date.now(), rxFrames, ecu.id);


      const oldOutputs = d.state?.outputs || {};
      const oldPending = d.state?.pendingCAN || [];
      const replacer = (_key: string, value: any) => typeof value === 'number' && isNaN(value) ? null : value;

      // Build output voltages map for the Live I/O display
      const outputVoltages: Record<string, number> = {};
      (Array.isArray(d.params?.outputs) ? d.params.outputs : ['out1', 'out2']).forEach((name: string) => {
        const v = logicResult.outputs[name];
        if (typeof v === 'number' && !isNaN(v)) outputVoltages[name] = v;
      });

      if (JSON.stringify(oldOutputs, replacer) !== JSON.stringify(logicResult.outputs, replacer) ||
        JSON.stringify(oldPending, replacer) !== JSON.stringify(logicResult.canFrames, replacer) ||
        JSON.stringify(d.state?.inputVoltages) !== JSON.stringify(logicInputs)) {

        state.updateNodeData(ecu.id, {
          state: {
            ...d.state,
            outputs: logicResult.outputs,
            pendingCAN: logicResult.canFrames,
            inputVoltages: logicInputs,
            outputVoltages,
          }
        } as any);

        result.events.push({
          level: 'info',
          message: `ECU ${d.label || ecu.id} Logic Update. In: ${JSON.stringify(logicInputs)} -> Out: ${JSON.stringify(logicResult.outputs, replacer)}`
        });
      }

      // 3. Process pending CAN frames if connected to a bus
      const pendingFrames = Array.isArray(d.state?.pendingCAN) ? d.state.pendingCAN : [];
      if (busId) {
        // Build set of active J1939 IDs from current pending frames
        const activeIds = new Set<number>();
        for (const frame of pendingFrames) {
          if (frame.type === 'J1939') {
            const j1939Id = CANScheduler.buildJ1939Id(frame.priority, frame.pgn, d.params.sourceAddress);
            activeIds.add(j1939Id);
            globalCANScheduler.registerPeriodicMessage(busId, {
              ...frame,
              id: j1939Id,
              ide: true,
              dlc: 8,
              timestamp: Date.now()
            }, frame.interval || 100);
          }
        }

        // Unregister any CAN_TX rules that are no longer active
        const canTxRules = logicRules.filter((r: any) => r.type === 'CAN_TX');
        for (const rule of canTxRules) {
          const cfg = rule.config;
          const j1939Id = CANScheduler.buildJ1939Id(cfg.priority || 6, cfg.pgn || 65262, d.params.sourceAddress);
          if (!activeIds.has(j1939Id)) {
            globalCANScheduler.unregisterPeriodicMessage(busId, j1939Id);
          }
        }
      }
    }

    // 4. Evaluate CAN Bus Health and Step Schedulers (per logical bus group)
    const processedLogicalBuses = new Set<string>();
    for (const bus of canBuses) {
      const logicalId = busToLogical.get(bus.id) || bus.id;
      if (processedLogicalBuses.has(logicalId)) continue;
      processedLogicalBuses.add(logicalId);

      // Collect all physical bus nodes in this logical group
      const groupBuses = canBuses.filter((b: RFNode) => (busToLogical.get(b.id) || b.id) === logicalId);

      // Collect all CAN_H nets across the entire logical group
      const groupCanHNets: string[] = [];
      for (const gb of groupBuses) {
        const nets = [
          result.netMap[`${gb.id}:can_h_l`],
          result.netMap[`${gb.id}:can_h_r`]
        ].filter(Boolean) as string[];
        groupCanHNets.push(...nets);
      }

      // Check bus health: at least one powered transceiver connected to this group
      const busHealthy = transceivers.some((t: RFNode) => {
        const isPowered = (t.data as any).state?.vcc > 10;
        if (!isPowered) return false;
        const transceiverCanHNet = result.netMap[`${t.id}:can_h`] || '';
        return groupCanHNets.includes(transceiverCanHNet);
      });

      // Step the scheduler using the logical bus ID
      const deliveredFrames = globalCANScheduler.step(logicalId, busHealthy, Date.now());

      // Update ALL physical bus nodes in this group with the same state
      for (const gb of groupBuses) {
        state.updateNodeData(gb.id, {
          state: { ...((gb.data as any).state || {}), isHealthy: busHealthy, lastFrames: deliveredFrames }
        } as any);
      }

      // Update transceiver transmitting state
      const isTransmitting = deliveredFrames.length > 0;
      if (isTransmitting) {
        const now = Date.now();
        setCanLogs((prev: CANFrame[]) => [...prev, ...deliveredFrames].filter((l: CANFrame) => l.timestamp > now - 60000));
      }

      transceivers.forEach(t => {
        const transceiverCanHNet = result.netMap[`${t.id}:can_h`] || '';
        if (groupCanHNets.includes(transceiverCanHNet)) {
          state.updateNodeData(t.id, {
            state: { ...((t.data as any).state || {}), isTransmitting }
          } as any);
        }
      });
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
    globalLogicRuntime.reset();
    globalCANScheduler.reset();
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
      if (d.type === 'ecu_advanced' || d.type === 'ecu') {
        state.updateNodeData(node.id, { state: { ...d.state, outputs: {}, outputVoltages: {}, inputVoltages: {} } } as any);
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

  const onClearCan = useCallback(() => {
    setCanLogs([]);
    globalCANScheduler.reset();
  }, []);

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

  const onFlipX = useCallback(() => {
    useStore.getState().flipHorizontal();
  }, []);

  const onFlipY = useCallback(() => {
    useStore.getState().flipVertical();
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
            onFlipX={onFlipX}
            onFlipY={onFlipY}
            onClearAll={onClearAll}
            onAutoLayout={onAutoLayout}
          />
          <CircuitCanvas />
          <SimConsole logs={logs} canLogs={canLogs} onClearCan={onClearCan} />
        </div>

        {/* Floating Tools */}
        <FaultInjectionPanel />
        <RulesEditor />

        {/* Right Inspector */}
        <Inspector />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
