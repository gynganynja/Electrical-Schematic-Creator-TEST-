import { useState } from 'react';
import { Terminal, Activity } from 'lucide-react';
import { CANMonitor } from './tools/CANMonitor';
import type { CANFrame } from '../simulation/can/types';

export interface LogEntry {
    time: string;
    level: 'info' | 'warn' | 'error';
    message: string;
}

interface ConsoleProps {
    logs: LogEntry[];
    canLogs: CANFrame[];
    onClearCan: () => void;
}

export function SimConsole({ logs, canLogs, onClearCan }: ConsoleProps) {
    const [activeTab, setActiveTab] = useState<'system' | 'can'>('system');

    return (
        <div className="h-64 border-t border-white/10 bg-transparent flex flex-col shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.2)] relative">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md -z-10"></div>

            {/* Tab Header */}
            <div className="px-4 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${activeTab === 'system' ? 'text-blue-400 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        <Terminal size={12} />
                        System Log
                    </button>
                    <button
                        onClick={() => setActiveTab('can')}
                        className={`py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${activeTab === 'can' ? 'text-indigo-400 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        <Activity size={12} />
                        CAN Monitor
                    </button>
                </div>
                <span className="text-[10px] text-slate-500 tabular-nums">
                    {activeTab === 'system' ? `${logs.length} events` : `${canLogs.length} frames`}
                </span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'system' ? (
                    <div className="p-3 h-full overflow-y-auto font-mono text-xs flex flex-col gap-0.5 scrollbar-thin">
                        {logs.length === 0 && (
                            <div className="text-slate-500">[System] Ready. Drop components and wire them up.</div>
                        )}
                        {logs.map((log, i) => (
                            <div
                                key={i}
                                className={`${log.level === 'error' ? 'text-red-400 drop-shadow-[0_0_2px_rgba(248,113,113,0.4)]' :
                                    log.level === 'warn' ? 'text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.4)]' :
                                        'text-blue-300'
                                    }`}
                            >
                                <span className="text-slate-500 mr-2">[{log.time}]</span>
                                {log.message}
                            </div>
                        ))}
                    </div>
                ) : (
                    <CANMonitor logs={canLogs} onClear={onClearCan} />
                )}
            </div>
        </div>
    );
}
