import React, { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    ConnectionMode,
} from '@xyflow/react';
import type { ReactFlowInstance, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useStore from '../store/useStore';
import { makeNode } from '../utils/componentDefaults';
import { BatteryNode } from './nodes/BatteryNode';
import { GroundNode } from './nodes/GroundNode';
import { LampNode } from './nodes/LampNode';
import { SwitchNode } from './nodes/SwitchNode';
import { ResistorNode } from './nodes/ResistorNode';
import { FuseNode } from './nodes/FuseNode';
import { RelayNode } from './nodes/RelayNode';
import { SpliceNode } from './nodes/SpliceNode';
import { MotorNode } from './nodes/MotorNode';
import { LEDNode } from './nodes/LEDNode';
import { DiodeNode } from './nodes/DiodeNode';
import { FlasherNode } from './nodes/FlasherNode';
import { BuzzerNode } from './nodes/BuzzerNode';
import { SolenoidNode } from './nodes/SolenoidNode';
import { MomentaryNONode } from './nodes/MomentaryNONode';
import { MomentaryNCNode } from './nodes/MomentaryNCNode';
import { SPDTSwitchNode } from './nodes/SPDTSwitchNode';
import { DPDTSwitchNode } from './nodes/DPDTSwitchNode';
import { IgnitionSwitchNode } from './nodes/IgnitionSwitchNode';
import { MasterSwitchNode } from './nodes/MasterSwitchNode';
import { BreakerManualNode } from './nodes/BreakerManualNode';
import { BreakerAutoNode } from './nodes/BreakerAutoNode';
import { FusibleLinkNode } from './nodes/FusibleLinkNode';
import { TVSClampNode } from './nodes/TVSClampNode';
import { CableResistanceNode } from './nodes/CableResistanceNode';
import { RelaySPSTNode } from './nodes/RelaySPSTNode';
import { RelayDual87Node } from './nodes/RelayDual87Node';
import { RelayLatchingNode } from './nodes/RelayLatchingNode';
import { RelayDelayOnNode } from './nodes/RelayDelayOnNode';
import { RelayDelayOffNode } from './nodes/RelayDelayOffNode';
import { HeaterNode } from './nodes/HeaterNode';
import { CompressorClutchNode } from './nodes/CompressorClutchNode';
import { WiperMotorNode } from './nodes/WiperMotorNode';
import { CapacitorNode } from './nodes/CapacitorNode';
import { InductorNode } from './nodes/InductorNode';
import { ZenerNode } from './nodes/ZenerNode';
import { PotentiometerNode } from './nodes/PotentiometerNode';
import { ECUNode } from './nodes/ECUNode';
import { ConnectorNode } from './nodes/ConnectorNode';
import { NetLabelNode } from './nodes/NetLabelNode';
import { HarnessEntryNode } from './nodes/HarnessEntryNode';
import { HarnessExitNode } from './nodes/HarnessExitNode';
import { TempSensorNode } from './nodes/TempSensorNode';
import { OilPressureSensorNode } from './nodes/OilPressureSensorNode';
import { AirPressureSensorNode } from './nodes/AirPressureSensorNode';
import { MAFSensorNode } from './nodes/MAFSensorNode';
import { TPSSensorNode } from './nodes/TPSSensorNode';
import { IgnitionCoilNode } from './nodes/IgnitionCoilNode';
import { ThrottleActuatorNode } from './nodes/ThrottleActuatorNode';
import { WheelSpeedSensorNode } from './nodes/WheelSpeedSensorNode';
import { RPMSensorNode } from './nodes/RPMSensorNode';
import { SpeedoGaugeNode } from './nodes/SpeedoGaugeNode';
import { TachoGaugeNode } from './nodes/TachoGaugeNode';
import { FuelGaugeNode } from './nodes/FuelGaugeNode';
import { CANBusNode } from './nodes/CANBusNode';
import { CANTransceiverNode } from './nodes/CANTransceiverNode';
import { CANTerminatorNode } from './nodes/CANTerminatorNode';
import { AdvancedECUNode } from './nodes/AdvancedECUNode';
import { SchematicFrameNode } from './nodes/SchematicFrameNode';
import { WireEdge } from './edges/WireEdge';

// Register all custom node types — must be defined OUTSIDE the component
// Wrapped with React.memo to prevent unnecessary re-renders during simulation ticks
const m = React.memo;
const nodeTypes: Record<string, any> = {
    battery: m(BatteryNode),
    ground: m(GroundNode),
    lamp: m(LampNode),
    switch_spst: m(SwitchNode),
    switch_momentary: m(SwitchNode),
    resistor: m(ResistorNode),
    fuse: m(FuseNode),
    relay_spdt: m(RelayNode),
    splice: m(SpliceNode),
    motor: m(MotorNode),
    led: m(LEDNode),
    diode: m(DiodeNode),
    flasher: m(FlasherNode),
    buzzer: m(BuzzerNode),
    solenoid: m(SolenoidNode),
    switch_momentary_no: m(MomentaryNONode),
    switch_momentary_nc: m(MomentaryNCNode),
    switch_spdt: m(SPDTSwitchNode),
    switch_dpdt: m(DPDTSwitchNode),
    switch_ignition: m(IgnitionSwitchNode),
    switch_master: m(MasterSwitchNode),
    breaker_manual: m(BreakerManualNode),
    breaker_auto: m(BreakerAutoNode),
    fusible_link: m(FusibleLinkNode),
    tvs_clamp: m(TVSClampNode),
    cable_resistance: m(CableResistanceNode),
    relay_spst: m(RelaySPSTNode),
    relay_dual87: m(RelayDual87Node),
    relay_latching: m(RelayLatchingNode),
    relay_delay_on: m(RelayDelayOnNode),
    relay_delay_off: m(RelayDelayOffNode),
    heater: m(HeaterNode),
    compressor_clutch: m(CompressorClutchNode),
    wiper_motor: m(WiperMotorNode),
    capacitor: m(CapacitorNode),
    inductor: m(InductorNode),
    zener: m(ZenerNode),
    potentiometer: m(PotentiometerNode),
    ecu: m(ECUNode),
    connector: m(ConnectorNode),
    net_label: m(NetLabelNode),
    harness_entry: m(HarnessEntryNode),
    harness_exit: m(HarnessExitNode),
    temp_sensor: m(TempSensorNode),
    oil_press_sensor: m(OilPressureSensorNode),
    air_press_sensor: m(AirPressureSensorNode),
    maf_sensor: m(MAFSensorNode),
    tps_sensor: m(TPSSensorNode),
    ignition_coil: m(IgnitionCoilNode),
    throttle_actuator: m(ThrottleActuatorNode),
    wss_sensor: m(WheelSpeedSensorNode),
    rpm_sensor: m(RPMSensorNode),
    speedo_gauge: m(SpeedoGaugeNode),
    tacho_gauge: m(TachoGaugeNode),
    fuel_gauge: m(FuelGaugeNode),
    can_bus: m(CANBusNode),
    can_transceiver: m(CANTransceiverNode),
    can_terminator: m(CANTerminatorNode),
    ecu_advanced: m(AdvancedECUNode),
    schematic_frame: m(SchematicFrameNode),
};

const edgeTypes: Record<string, any> = {
    wire: WireEdge,
};

const defaultEdgeOptions = {
    type: 'wire',
};

// Don't blow a lone component up to max zoom when the view is first fitted
const fitViewOptions = { padding: 0.15, maxZoom: 1.2 };

/**
 * Find the closest edge to a given position (within threshold).
 * Used when dropping a splice onto an existing wire.
 */
function findClosestEdge(
    nodes: Node[],
    edges: Edge[],
    pos: { x: number; y: number },
    threshold = 30,
): Edge | null {
    let closest: Edge | null = null;
    let minDist = threshold;

    for (const edge of edges) {
        const srcNode = nodes.find(n => n.id === edge.source);
        const tgtNode = nodes.find(n => n.id === edge.target);
        if (!srcNode || !tgtNode) continue;

        // Approximate edge as a line between node centers
        const sx = srcNode.position.x + (srcNode.measured?.width ?? 60) / 2;
        const sy = srcNode.position.y + (srcNode.measured?.height ?? 40) / 2;
        const tx = tgtNode.position.x + (tgtNode.measured?.width ?? 60) / 2;
        const ty = tgtNode.position.y + (tgtNode.measured?.height ?? 40) / 2;

        const dist = pointToSegmentDist(pos.x, pos.y, sx, sy, tx, ty);
        if (dist < minDist) {
            minDist = dist;
            closest = edge;
        }
    }

    return closest;
}

/** Point-to-line-segment distance */
function pointToSegmentDist(
    px: number, py: number,
    ax: number, ay: number,
    bx: number, by: number,
): number {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - ax, py - ay);

    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const cx = ax + t * dx;
    const cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
}

export function CircuitCanvas() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useStore();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

    const onInit = useCallback((instance: ReactFlowInstance) => {
        reactFlowInstance.current = instance;
    }, []);

    // Keyboard shortcuts (ignored while typing in a field so text undo still works)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;

            const isCtrl = e.ctrlKey || e.metaKey;
            if (!isCtrl) return;
            const key = e.key.toLowerCase();
            const store = useStore.getState();

            if (key === 'z') {
                e.preventDefault();
                if (e.shiftKey) store.redo();
                else store.undo();
            } else if (key === 'y') {
                e.preventDefault();
                store.redo();
            } else if (key === 'c') {
                store.copySelection();
            } else if (key === 'v') {
                e.preventDefault();
                store.paste();
            } else if (key === 'd') {
                e.preventDefault();
                if (store.copySelection() > 0) store.paste();
            } else if (key === 'a') {
                e.preventDefault();
                useStore.setState({ nodes: store.nodes.map(n => ({ ...n, selected: true })) });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type || !reactFlowInstance.current) return;

            const position = reactFlowInstance.current.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = makeNode(type, position);
            const id = newNode.id;
            addNode(newNode);

            // Only auto-split if splice is dropped directly ON an existing wire (10px threshold)
            if (type === 'splice') {
                const store = useStore.getState();
                const closestEdge = findClosestEdge(store.nodes, store.edges, position, 10);
                if (closestEdge) {
                    // Remove the original edge
                    const remainingEdges = store.edges.filter(e => e.id !== closestEdge.id);

                    // Create two new edges: source→splice and splice→target
                    const edge1 = {
                        id: `e-${closestEdge.source}-${id}`,
                        source: closestEdge.source,
                        sourceHandle: closestEdge.sourceHandle,
                        target: id,
                        targetHandle: 'l',   // incoming from left
                        type: 'wire',
                        data: { resistance: 0.001 },
                    };
                    const edge2 = {
                        id: `e-${id}-${closestEdge.target}`,
                        source: id,
                        sourceHandle: 'r_out', // outgoing to right
                        target: closestEdge.target,
                        targetHandle: closestEdge.targetHandle,
                        type: 'wire',
                        data: { resistance: 0.001 },
                    };

                    useStore.setState({ edges: [...remainingEdges, edge1, edge2] });
                }
            }
        },
        [addNode],
    );

    const nodeIds = new Set(nodes.map(n => n.id));
    const validEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    return (
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
            {nodes.length === 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="text-center max-w-sm px-6 py-5 rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur-sm shadow-xl">
                        <div className="text-slate-200 font-semibold mb-1">Start a circuit</div>
                        <div className="text-sm text-slate-400 leading-relaxed">
                            Drag components from the palette (or click them), wire handle to handle, then press <span className="text-blue-300 font-medium">Run</span>.
                            Or load one of the <span className="text-blue-300 font-medium">Examples</span>.
                        </div>
                        <div className="mt-3 text-[11px] text-slate-500 font-mono">Ctrl+Z undo · Ctrl+C/V copy/paste · Ctrl+D duplicate · Del delete</div>
                    </div>
                </div>
            )}
            <ReactFlow
                nodes={nodes}
                edges={validEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={onInit as any}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                fitViewOptions={fitViewOptions}
                snapToGrid
                snapGrid={[20, 20]}
                deleteKeyCode={['Backspace', 'Delete']}
                connectionMode={ConnectionMode.Loose}
                proOptions={{ hideAttribution: true }}
                panOnDrag={[0, 1, 2]}
                zoomOnPinch
                panOnScroll={false}
                zoomOnScroll
                minZoom={0.1}
                maxZoom={4}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
                <Controls className="!bg-slate-800 !border-slate-700 !rounded-lg !shadow-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700" />
                <MiniMap
                    nodeStrokeColor="#38bdf8"
                    nodeColor="#1e293b"
                    maskColor="rgba(2,6,23,0.7)"
                    className="!bg-slate-900 !border !border-slate-700 !rounded-lg max-md:!hidden"
                />
            </ReactFlow>
        </div>
    );
}
