import React, { useState } from 'react';
import { ShieldAlert, Zap, Scissors, Ghost } from 'lucide-react';
import useStore from '../../store/useStore';

export function FaultInjectionPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const { nodes, updateNodeData } = useStore();

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 bg-red-600/90 text-white p-3 rounded-full shadow-lg hover:bg-red-500 transition-all z-50 flex items-center gap-2 group"
            >
                <ShieldAlert size={20} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-sm font-bold uppercase whitespace-nowrap">Fault Injector</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 w-72 bg-slate-900 border border-red-500/30 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-md">
            <div className="bg-red-600 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
                    <Zap size={16} />
                    Fault Injection
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin">
                {/* Global Bus Faults */}
                <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Global Scenarios</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <FaultBtn icon={<Scissors size={12} />} label="Bus Open" active={false} />
                        <FaultBtn icon={<Ghost size={12} />} label="Short to GND" active={false} />
                    </div>
                </div>

                {/* Component Faults */}
                <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Active Components</h3>
                    {nodes.filter(n => ['ecu_advanced', 'can_transceiver', 'sensor'].includes((n.data as any).type)).map(node => (
                        <div key={node.id} className="p-2 bg-slate-950 rounded border border-white/5 flex flex-col gap-2">
                            <span className="text-[9px] font-mono text-slate-400 truncate">{(node.data as any).label}</span>
                            <div className="flex gap-1">
                                <button
                                    className={`flex-1 text-[8px] py-1 rounded border transition-all ${(node.data as any).state?.fault === 'OPEN' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-transparent text-slate-500 hover:text-slate-300'}`}
                                    onClick={() => updateNodeData(node.id, { state: { ...(node.data as any).state, fault: 'OPEN' } })}
                                >
                                    OPEN
                                </button>
                                <button
                                    className={`flex-1 text-[8px] py-1 rounded border transition-all ${(node.data as any).state?.fault === 'SHORT_GND' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-transparent text-slate-500 hover:text-slate-300'}`}
                                    onClick={() => updateNodeData(node.id, { state: { ...(node.data as any).state, fault: 'SHORT_GND' } })}
                                >
                                    SHORT GND
                                </button>
                                <button
                                    className="px-2 text-[8px] py-1 rounded bg-slate-700 text-slate-300"
                                    onClick={() => updateNodeData(node.id, { state: { ...(node.data as any).state, fault: 'NONE' } })}
                                >
                                    CLR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-white/5 text-center">
                <button className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase underline">Remove All Faults</button>
            </div>
        </div>
    );
}

function FaultBtn({ icon, label, active }: { icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <button className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[9px] font-bold uppercase transition-all border ${active ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>
            {icon}
            {label}
        </button>
    )
}
