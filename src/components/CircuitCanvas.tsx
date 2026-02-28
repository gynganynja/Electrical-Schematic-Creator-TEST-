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
const nodeTypes: Record<string, any> = {
    battery: BatteryNode,
    ground: GroundNode,
    lamp: LampNode,
    switch_spst: SwitchNode,
    switch_momentary: SwitchNode,
    resistor: ResistorNode,
    fuse: FuseNode,
    relay_spdt: RelayNode,
    splice: SpliceNode,
    motor: MotorNode,
    led: LEDNode,
    diode: DiodeNode,
    flasher: FlasherNode,
    buzzer: BuzzerNode,
    solenoid: SolenoidNode,
    switch_momentary_no: MomentaryNONode,
    switch_momentary_nc: MomentaryNCNode,
    switch_spdt: SPDTSwitchNode,
    switch_dpdt: DPDTSwitchNode,
    switch_ignition: IgnitionSwitchNode,
    switch_master: MasterSwitchNode,
    breaker_manual: BreakerManualNode,
    breaker_auto: BreakerAutoNode,
    fusible_link: FusibleLinkNode,
    tvs_clamp: TVSClampNode,
    cable_resistance: CableResistanceNode,
    relay_spst: RelaySPSTNode,
    relay_dual87: RelayDual87Node,
    relay_latching: RelayLatchingNode,
    relay_delay_on: RelayDelayOnNode,
    relay_delay_off: RelayDelayOffNode,
    heater: HeaterNode,
    compressor_clutch: CompressorClutchNode,
    wiper_motor: WiperMotorNode,
    capacitor: CapacitorNode,
    inductor: InductorNode,
    zener: ZenerNode,
    potentiometer: PotentiometerNode,
    ecu: ECUNode,
    connector: ConnectorNode,
    net_label: NetLabelNode,
    harness_entry: HarnessEntryNode,
    harness_exit: HarnessExitNode,
    temp_sensor: TempSensorNode,
    oil_press_sensor: OilPressureSensorNode,
    air_press_sensor: AirPressureSensorNode,
    maf_sensor: MAFSensorNode,
    wss_sensor: WheelSpeedSensorNode,
    rpm_sensor: RPMSensorNode,
    speedo_gauge: SpeedoGaugeNode,
    tacho_gauge: TachoGaugeNode,
    fuel_gauge: FuelGaugeNode,
    can_bus: CANBusNode,
    can_transceiver: CANTransceiverNode,
    can_terminator: CANTerminatorNode,
    ecu_advanced: AdvancedECUNode,
    schematic_frame: SchematicFrameNode,
};

const edgeTypes: Record<string, any> = {
    wire: WireEdge,
};

const defaultEdgeOptions = {
    type: 'wire',
};

/** Generate a unique node ID that won't collide with any existing node */
function getNextNodeId(): string {
    const nodes = useStore.getState().nodes;
    let maxId = 0;
    for (const node of nodes) {
        const num = parseInt(node.id, 10);
        if (!isNaN(num) && num > maxId) maxId = num;
    }
    return String(maxId + 1);
}

function makeDefaultData(type: string, id: string): Record<string, any> {
    switch (type) {
        case 'battery':
            return { id, type, label: `BAT${id}`, state: {}, params: { voltage: 12, internalResistance: 0.05 } };
        case 'ground':
            return { id, type, label: `GND${id}`, state: {}, params: {} };
        case 'resistor':
            return { id, type, label: `R${id}`, state: {}, params: { resistance: 100 } };
        case 'lamp':
            return { id, type, label: `L${id}`, state: { on: false }, params: { resistance: 24 } };
        case 'switch_spst':
            return { id, type, label: `S${id}`, state: { closed: false }, params: {} };
        case 'switch_momentary':
            return { id, type: 'switch_spst', label: `MOM${id}`, state: { closed: false }, params: {} };
        case 'fuse':
            return { id, type, label: `F${id}`, state: { blown: false }, params: { tripCurrent: 15, tripTimeMs: 100 } };
        case 'relay_spdt':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } };
        case 'splice':
            return { id, type, label: `SP${id}`, state: {}, params: {} };
        case 'motor':
            return { id, type, label: `M${id}`, state: { running: false }, params: { resistance: 4 } };
        case 'led':
            return { id, type, label: `LED${id}`, state: { on: false }, params: { resistance: 150, color: '#ef4444' } };
        case 'diode':
            return { id, type, label: `D${id}`, state: {}, params: { forwardDrop: 0.7 } };
        case 'flasher':
            return { id, type, label: `FL${id}`, state: { outputOn: false }, params: { rateHz: 1.5, resistance: 1 } };
        case 'buzzer':
            return { id, type, label: `BZ${id}`, state: { on: false }, params: { resistance: 50 } };
        case 'solenoid':
            return { id, type, label: `SOL${id}`, state: { activated: false }, params: { resistance: 10 } };
        case 'switch_momentary_no':
            return { id, type, label: `PB_NO${id}`, state: { closed: false }, params: {} };
        case 'switch_momentary_nc':
            return { id, type, label: `PB_NC${id}`, state: { open: false }, params: {} };
        case 'switch_spdt':
            return { id, type, label: `SW${id}`, state: { position: 'nc' }, params: {} };
        case 'switch_dpdt':
            return { id, type, label: `DPDT${id}`, state: { position: 'nc' }, params: {} };
        case 'switch_ignition':
            return { id, type, label: `IGN${id}`, state: { position: 'off' }, params: {} };
        case 'switch_master':
            return { id, type, label: `MSTR${id}`, state: { closed: false }, params: {} };
        case 'breaker_manual':
            return { id, type, label: `CB${id}`, state: { tripped: false }, params: { tripCurrent: 20, tripTimeMs: 50 } };
        case 'breaker_auto':
            return { id, type, label: `ACB${id}`, state: { tripped: false }, params: { tripCurrent: 20, tripTimeMs: 50, resetDelayMs: 2000 } };
        case 'fusible_link':
            return { id, type, label: `FL${id}`, state: { blown: false }, params: { tripCurrent: 80, tripTimeMs: 500 } };
        case 'tvs_clamp':
            return { id, type, label: `TVS${id}`, state: {}, params: { clampVoltage: 36, forwardDrop: 0.7 } };
        case 'cable_resistance':
            return { id, type, label: `W${id}`, state: {}, params: { resistance: 0.1, length_m: 10, gauge: '10 AWG' } };
        case 'relay_spst':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } };
        case 'relay_dual87':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } };
        case 'relay_latching':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } };
        case 'relay_delay_on':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8, delayMs: 2000 } };
        case 'relay_delay_off':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8, delayMs: 5000 } };
        case 'heater':
            return { id, type, label: `HTR${id}`, state: { on: false }, params: { resistance: 12 } };
        case 'compressor_clutch':
            return { id, type, label: `AC${id}`, state: { activated: false }, params: { resistance: 3 } };
        case 'wiper_motor':
            return { id, type, label: `WPR${id}`, state: { running: false, parkClosed: true }, params: { resistance: 6 } };
        case 'capacitor':
            return { id, type, label: `C${id}`, state: {}, params: { capacitance: '100µF' } };
        case 'inductor':
            return { id, type, label: `L${id}`, state: {}, params: { inductance: '10mH', resistance: 0.5 } };
        case 'zener':
            return { id, type, label: `ZD${id}`, state: {}, params: { breakdownVoltage: 5.1, forwardDrop: 0.7 } };
        case 'potentiometer':
            return { id, type, label: `POT${id}`, state: { position: 50 }, params: { resistance: 10000 } };
        case 'ecu':
            return { id, type, label: `ECU${id}`, state: {}, params: { numInputs: 4, numOutputs: 4 } };
        case 'connector':
            return { id, type, label: `J${id}`, state: {}, params: { numPins: 4 } };
        case 'net_label':
            return { id, type, label: `NET${id}`, state: {}, params: { color: '#38bdf8' } };
        case 'harness_entry':
            return { id, type, label: `H${id}`, state: {}, params: { numPins: 6, color: '#64748b' } };
        case 'harness_exit':
            return { id, type, label: `H${id}`, state: {}, params: { numPins: 6, color: '#64748b' } };
        case 'temp_sensor':
            return { id, type, label: `TEMP${id}`, state: { temperature: 25 }, params: {} };
        case 'oil_press_sensor':
            return { id, type, label: `OIL${id}`, state: { pressure: 40 }, params: {} };
        case 'air_press_sensor':
            return { id, type, label: `AIR${id}`, state: { pressure: 101.3 }, params: {} };
        case 'maf_sensor':
            return { id, type, label: `MAF${id}`, state: { flow: 5 }, params: {} };
        case 'wss_sensor':
            return { id, type, label: `WSS${id}`, state: { speed: 0 }, params: {} };
        case 'speedo_gauge':
            return { id, type, label: `SPD${id}`, state: { voltage: 0 }, params: {} };
        case 'tacho_gauge':
            return { id, type, label: `TACH${id}`, state: { voltage: 0 }, params: {} };
        case 'fuel_gauge':
            return { id, type, label: `FUEL${id}`, state: { voltage: 0 }, params: {} };
        case 'can_bus':
            return { id, type, label: `CAN${id}`, state: {}, params: { bitrate: 500000, mode: 'HS-CAN' } };
        case 'can_transceiver':
            return { id, type, label: `XCVR${id}`, state: { vcc: 0 }, params: {} };
        case 'can_terminator':
            return { id, type, label: `TERM${id}`, state: {}, params: {} };
        case 'ecu_advanced':
            return { id, type, label: `ECU${id}`, state: { vcc: 0 }, params: { canMode: 'J1939', sourceAddress: 0x01 } };
        case 'schematic_frame':
            return { id, type, label: `FRAME${id}`, state: {}, params: { frameName: `Sheet ${id}`, frameDescription: '' } };
        default:
            return { id, type: 'resistor', label: `R${id}`, state: {}, params: { resistance: 100 } };
    }
}

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

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isCtrl = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();

            if (isCtrl && key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    useStore.getState().redo();
                } else {
                    useStore.getState().undo();
                }
            } else if (isCtrl && key === 'y') {
                e.preventDefault();
                useStore.getState().redo();
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

            const id = getNextNodeId();
            const newNodeData = makeDefaultData(type, id);

            // Add the new node
            const isFrame = type === 'schematic_frame';
            addNode({
                id,
                type,
                position,
                data: newNodeData,
                ...(isFrame ? {
                    zIndex: -1,
                    style: { width: 800, height: 500 },
                    resizing: true,
                } : {}),
            } as Node);

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
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
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
                snapToGrid
                snapGrid={[20, 20]}
                deleteKeyCode={['Backspace', 'Delete']}
                connectionMode={ConnectionMode.Loose}
                proOptions={{ hideAttribution: true }}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
                <Controls className="!bg-slate-800 !border-slate-700 !rounded-lg !shadow-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700" />
                <MiniMap
                    nodeStrokeColor="#38bdf8"
                    nodeColor="#1e293b"
                    maskColor="rgba(2,6,23,0.7)"
                    className="!bg-slate-900 !border !border-slate-700 !rounded-lg"
                />
            </ReactFlow>
        </div>
    );
}
