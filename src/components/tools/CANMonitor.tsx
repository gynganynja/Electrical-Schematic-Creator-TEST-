import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Search, Ban, Play } from 'lucide-react';
import type { CANFrame } from '../../simulation/can/types';

interface CANMonitorProps {
    logs: CANFrame[];
    onClear: () => void;
}

export function CANMonitor({ logs, onClear }: CANMonitorProps) {
    const [filter, setFilter] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const baseTimeRef = useRef<number | null>(null);

    // Set base time on first log arrival, reset when cleared
    useEffect(() => {
        if (logs.length > 0 && baseTimeRef.current === null) {
            baseTimeRef.current = logs[0].timestamp;
        }
        if (logs.length === 0) {
            baseTimeRef.current = null;
        }
    }, [logs]);

    // Auto-scroll logic
    useEffect(() => {
        if (!isPaused && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isPaused]);

    const filteredLogs = logs.filter(f =>
        f.id.toString(16).includes(filter.toLowerCase()) ||
        f.data.join(',').includes(filter)
    );

    return (
        <div className="flex flex-col h-full bg-slate-950 border-t border-white/5 font-mono text-[11px] overflow-hidden">
            {/* Toolbar */}
            <div className="h-9 border-b border-white/5 px-4 flex items-center justify-between bg-slate-900/40 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-indigo-400">
                        <Terminal size={14} />
                        <span className="font-bold uppercase tracking-widest text-[10px]">CAN Bus Monitor</span>
                    </div>

                    <div className="relative">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter ID/Data..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded px-7 py-1 w-48 text-slate-300 focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                </div>

                <div className="flex gap-1">
                    <MonitorBtn
                        icon={isPaused ? <Play size={12} /> : <Ban size={12} />}
                        label={isPaused ? "Resume" : "Pause"}
                        onClick={() => setIsPaused(!isPaused)}
                    />
                    <MonitorBtn icon={<Ban size={12} />} label="Clear" onClick={onClear} />
                </div>
            </div>

            {/* Header */}
            <div className="grid grid-cols-[80px_60px_40px_160px_auto] px-4 py-1.5 border-b border-white/5 bg-slate-950 text-slate-500 font-bold uppercase text-[9px]">
                <div>Timestamp</div>
                <div>ID</div>
                <div>DLC</div>
                <div>Data (HEX)</div>
                <div>Decoded / Info</div>
            </div>

            {/* Log Area */}
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                {filteredLogs.map((log, i) => (
                    <div key={i} className="grid grid-cols-[80px_60px_40px_160px_auto] px-4 py-1 border-b border-white/5 hover:bg-white/[0.02] transition-colors tabular-nums">
                        <div className="text-slate-500">{(((log.timestamp - (baseTimeRef.current ?? log.timestamp)) / 1000)).toFixed(3)}s</div>
                        <div className="text-indigo-400 font-bold">0x{log.id.toString(16).toUpperCase().padStart(log.ide ? 8 : 3, '0')}</div>
                        <div className="text-slate-400">{log.dlc}</div>
                        <div className="text-slate-200">
                            {log.data.map((b: number) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
                        </div>
                        <div className="text-emerald-500/80 truncate italic">
                            {decodeFrameInfo(log)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function decodeFrameInfo(log: CANFrame): string {
    // Basic J1939 PGN Decoding
    if (log.ide) {
        const pgn = (log.id >> 8) & 0x3FFFF;
        if (pgn === 61444) return "Engine Temperature (ET1)";
        if (pgn === 61443) return "Electronic Engine Controller 2 (EEC2)";
        if (pgn === 65262) return "Engine Temperature 1 (ET1)";
        return `J1939 PGN: ${pgn}`;
    }
    return "Standard CAN frame";
}

function MonitorBtn({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition-all border border-transparent hover:border-indigo-500/30"
            onClick={onClick}
            title={label}
        >
            {icon}
            <span className="text-[10px] hidden sm:inline">{label}</span>
        </button>
    )
}
