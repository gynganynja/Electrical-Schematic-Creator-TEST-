import React from 'react';
import type { ComponentType } from '../types/circuit';
import { BatteryMedium, Lightbulb, ToggleLeft, Activity, Zap, ShieldAlert, GitBranch, FileDown, Circle, Disc, ArrowRightCircle, Timer, Volume2, Magnet, LampDesk, Power, Key, ArrowLeftRight, Maximize2, ShieldCheck, RefreshCw, Cable, Flame, Snowflake, Gauge, Cpu, Plug, Tag } from 'lucide-react';
import { EXAMPLE_PROJECTS } from '../examples/circuits';
import useStore from '../store/useStore';

interface PaletteItemProps {
    type: ComponentType;
    label: string;
    icon: React.ReactNode;
}

const PALETTE_ITEMS: PaletteItemProps[] = [
    { type: 'battery', label: 'Battery 12V', icon: <BatteryMedium size={18} /> },
    { type: 'ground', label: 'Ground', icon: <div className="font-bold text-green-600">⏚</div> },
    { type: 'fuse', label: 'Fuse', icon: <ShieldAlert size={18} /> },
    { type: 'switch_spst', label: 'Switch SPST', icon: <ToggleLeft size={18} /> },
    { type: 'switch_momentary_no', label: 'Push Button NO', icon: <ToggleLeft size={18} /> },
    { type: 'switch_momentary_nc', label: 'Push Button NC', icon: <ToggleLeft size={18} /> },
    { type: 'switch_spdt', label: 'Switch SPDT', icon: <ArrowLeftRight size={18} /> },
    { type: 'switch_dpdt', label: 'Switch DPDT', icon: <Maximize2 size={18} /> },
    { type: 'switch_ignition', label: 'Ignition Switch', icon: <Key size={18} /> },
    { type: 'switch_master', label: 'Master Isolator', icon: <Power size={18} /> },
    { type: 'relay_spdt', label: 'Relay SPDT', icon: <GitBranch size={18} /> },
    { type: 'relay_spst', label: 'Relay SPST (NO)', icon: <GitBranch size={18} /> },
    { type: 'relay_dual87', label: 'Relay Dual 87', icon: <GitBranch size={18} /> },
    { type: 'relay_latching', label: 'Relay Latching', icon: <GitBranch size={18} /> },
    { type: 'relay_delay_on', label: 'Relay On-Delay', icon: <GitBranch size={18} /> },
    { type: 'relay_delay_off', label: 'Relay Off-Delay', icon: <GitBranch size={18} /> },
    { type: 'lamp', label: 'Lamp', icon: <Lightbulb size={18} /> },
    { type: 'led', label: 'LED', icon: <LampDesk size={18} /> },
    { type: 'resistor', label: 'Resistor', icon: <Activity size={18} /> },
    { type: 'motor', label: 'DC Motor', icon: <Disc size={18} /> },
    { type: 'diode', label: 'Diode', icon: <ArrowRightCircle size={18} /> },
    { type: 'flasher', label: 'Flasher / Blinker', icon: <Timer size={18} /> },
    { type: 'buzzer', label: 'Buzzer / Horn', icon: <Volume2 size={18} /> },
    { type: 'solenoid', label: 'Solenoid', icon: <Magnet size={18} /> },
    { type: 'breaker_manual', label: 'Breaker (Manual)', icon: <ShieldCheck size={18} /> },
    { type: 'breaker_auto', label: 'Breaker (Auto)', icon: <RefreshCw size={18} /> },
    { type: 'fusible_link', label: 'Fusible Link', icon: <Zap size={18} /> },
    { type: 'tvs_clamp', label: 'TVS / Surge Clamp', icon: <ShieldAlert size={18} /> },
    { type: 'cable_resistance', label: 'Cable Resistance', icon: <Cable size={18} /> },
    { type: 'heater', label: 'Heater', icon: <Flame size={18} /> },
    { type: 'compressor_clutch', label: 'A/C Clutch', icon: <Snowflake size={18} /> },
    { type: 'wiper_motor', label: 'Wiper Motor', icon: <Disc size={18} /> },
    { type: 'capacitor', label: 'Capacitor', icon: <Activity size={18} /> },
    { type: 'inductor', label: 'Inductor', icon: <Activity size={18} /> },
    { type: 'zener', label: 'Zener Diode', icon: <Zap size={18} /> },
    { type: 'potentiometer', label: 'Potentiometer', icon: <Gauge size={18} /> },
    { type: 'ecu', label: 'ECU Module', icon: <Cpu size={18} /> },
    { type: 'connector', label: 'Connector', icon: <Plug size={18} /> },
    { type: 'net_label', label: 'Net Label', icon: <Tag size={18} /> },
    { type: 'harness_entry', label: 'Harness Entry', icon: <Cable size={18} /> },
    { type: 'harness_exit', label: 'Harness Exit', icon: <Cable size={18} /> },
    { type: 'splice', label: 'Wire Splice', icon: <Circle size={12} className="fill-current" /> },
];

export function Palette() {
    const onDragStart = (event: React.DragEvent, nodeType: ComponentType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 border-r border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col h-full select-none shadow-xl">
            <div className="p-4 border-b border-white/10 font-semibold flex items-center gap-2 text-slate-100">
                <Zap size={18} className="text-blue-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                Components
            </div>
            <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-1.5">
                {/* Power */}
                <SectionHeader>Power</SectionHeader>
                {PALETTE_ITEMS.filter(i => ['battery', 'ground'].includes(i.type)).map(i => (
                    <PaletteItem key={i.type} item={i} onDragStart={onDragStart} />
                ))}

                {/* Protection */}
                <SectionHeader>Protection</SectionHeader>
                {PALETTE_ITEMS.filter(i => ['fuse', 'diode', 'breaker_manual', 'breaker_auto', 'fusible_link', 'tvs_clamp'].includes(i.type)).map(i => (
                    <PaletteItem key={i.type} item={i} onDragStart={onDragStart} />
                ))}

                {/* Switching */}
                <SectionHeader>Switching</SectionHeader>
                {PALETTE_ITEMS.filter(i => ['switch_spst', 'switch_momentary_no', 'switch_momentary_nc', 'switch_spdt', 'switch_dpdt', 'switch_ignition', 'switch_master', 'relay_spdt', 'relay_spst', 'relay_dual87', 'relay_latching', 'relay_delay_on', 'relay_delay_off', 'flasher'].includes(i.type)).map(i => (
                    <PaletteItem key={i.type} item={i} onDragStart={onDragStart} />
                ))}

                {/* Loads / Outputs */}
                <SectionHeader>Loads / Outputs</SectionHeader>
                {PALETTE_ITEMS.filter(i => ['lamp', 'led', 'resistor', 'motor', 'buzzer', 'solenoid', 'heater', 'compressor_clutch', 'wiper_motor'].includes(i.type)).map(i => (
                    <PaletteItem key={i.type} item={i} onDragStart={onDragStart} />
                ))}

                {/* Passives */}
                <SectionHeader>Passives / Sensors</SectionHeader>
                {PALETTE_ITEMS.filter(i => ['capacitor', 'inductor', 'zener', 'potentiometer', 'ecu'].includes(i.type)).map(i => (
                    <PaletteItem key={i.type} item={i} onDragStart={onDragStart} />
                ))}

                {/* Wiring */}
                <SectionHeader>Wiring / Harness</SectionHeader>
                {PALETTE_ITEMS.filter(i => ['splice', 'cable_resistance', 'connector', 'net_label', 'harness_entry', 'harness_exit'].includes(i.type)).map(i => (
                    <PaletteItem key={i.type} item={i} onDragStart={onDragStart} />
                ))}

                {/* Examples */}
                <SectionHeader>Examples</SectionHeader>
                {EXAMPLE_PROJECTS.map((ex) => (
                    <button
                        key={ex.name}
                        onClick={() => {
                            useStore.setState({ nodes: ex.nodes as any, edges: ex.edges as any });
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 border border-blue-900/50 rounded-md bg-blue-950/30 hover:bg-blue-900/50 hover:border-blue-500 cursor-pointer transition-all text-left w-full group"
                    >
                        <FileDown size={16} className="text-blue-400 shrink-0 group-hover:text-blue-300" />
                        <div>
                            <div className="text-sm font-medium text-blue-200 group-hover:text-blue-100">{ex.name}</div>
                            <div className="text-[10px] text-blue-400/80">{ex.description}</div>
                        </div>
                    </button>
                ))}

                <div className="mt-4 text-xs text-slate-400 text-center italic">Drag items to canvas</div>
            </div>
        </div>
    );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
    return <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3 mb-1">{children}</div>;
}

function PaletteItem({ item, onDragStart }: { item: PaletteItemProps; onDragStart: (e: React.DragEvent, type: ComponentType) => void }) {
    return (
        <div
            className="flex items-center gap-3 px-3 py-2.5 border border-slate-800 rounded-md bg-slate-800/50 hover:bg-slate-700/80 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.15)] cursor-grab active:cursor-grabbing transition-all"
            onDragStart={(event) => onDragStart(event, item.type)}
            draggable
        >
            <div className="text-slate-300">{item.icon}</div>
            <span className="text-sm font-medium text-slate-200">{item.label}</span>
        </div>
    );
}
