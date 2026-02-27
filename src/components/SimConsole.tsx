
export interface LogEntry {
    time: string;
    level: 'info' | 'warn' | 'error';
    message: string;
}

interface ConsoleProps {
    logs: LogEntry[];
}

export function SimConsole({ logs }: ConsoleProps) {
    return (
        <div className="h-48 border-t border-white/10 bg-transparent flex flex-col shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.2)] relative">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md -z-10"></div>
            <div className="px-4 py-2 border-b border-white/10 font-semibold text-xs text-slate-300 flex items-center justify-between tracking-wider">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>System Log</span>
                <span className="text-[10px] text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full shadow-inner">{logs.length} events</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto font-mono text-xs flex flex-col gap-0.5 scrollbar-thin">
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
        </div>
    );
}
