import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, FlipHorizontal, FlipVertical, Save, FolderOpen, Download, Trash2, LayoutGrid, Menu, X, Undo2, Redo2 } from 'lucide-react';
import useStore from '../store/useStore';
import { useIsMobile } from '../hooks/useIsMobile';

interface ToolbarProps {
    simState: 'stopped' | 'running' | 'paused';
    onRun: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onSave: () => void;
    onLoad: () => void;
    onExport: () => void;
    onFlipX: () => void;
    onFlipY: () => void;
    onClearAll: () => void;
    onAutoLayout: () => void;
    onUndo: () => void;
    onRedo: () => void;
}

export function Toolbar({ simState, onRun, onPause, onStep, onReset, onSave, onLoad, onExport, onFlipX, onFlipY, onClearAll, onAutoLayout, onUndo, onRedo }: ToolbarProps) {
    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const canUndo = useStore(s => s.past.length > 0);
    const canRedo = useStore(s => s.future.length > 0);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, [menuOpen]);

    const wrap = (fn: () => void) => () => { fn(); setMenuOpen(false); };

    return (
        <div className="h-14 border-b border-white/10 bg-slate-900/60 backdrop-blur-md flex items-center px-4 justify-between shrink-0 shadow-lg relative">
            <h1 className="font-bold text-base md:text-lg text-slate-100 flex items-center gap-2 drop-shadow-sm tracking-tight">
                <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">⚡</span>
                <span className="hidden xl:inline whitespace-nowrap">Circuit Generator</span>
                <span className="xl:hidden">CktGen</span>
                <SimStatus simState={simState} />
            </h1>

            {isMobile ? (
                <div className="flex gap-1.5 items-center" ref={menuRef}>
                    {/* Always-visible sim controls on mobile */}
                    {simState === 'running' ? (
                        <ToolBtn icon={<Pause size={16} />} label="Pause" onClick={onPause} accent />
                    ) : (
                        <ToolBtn icon={<Play size={16} />} label="Run" onClick={onRun} accent />
                    )}
                    <ToolBtn icon={<SkipForward size={16} />} label="Step" onClick={onStep} />
                    <ToolBtn icon={<RotateCcw size={16} />} label="Reset" onClick={onReset} />

                    {/* Hamburger for the rest */}
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="w-9 h-9 rounded-md bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                        aria-label="More options"
                    >
                        {menuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                    {/* Dropdown menu */}
                    {menuOpen && (
                        <div className="absolute top-14 right-2 z-50 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 min-w-[180px]">
                            <MenuSection label="Edit" />
                            <MenuItem icon={<Undo2 size={16} />} label="Undo" onClick={wrap(onUndo)} disabled={!canUndo} />
                            <MenuItem icon={<Redo2 size={16} />} label="Redo" onClick={wrap(onRedo)} disabled={!canRedo} />
                            <MenuItem icon={<FlipHorizontal size={16} />} label="Flip X" onClick={wrap(onFlipX)} />
                            <MenuItem icon={<FlipVertical size={16} />} label="Flip Y" onClick={wrap(onFlipY)} />
                            <MenuItem icon={<LayoutGrid size={16} />} label="Auto Layout" onClick={wrap(onAutoLayout)} />
                            <MenuItem icon={<Trash2 size={16} />} label="Clear All" onClick={wrap(onClearAll)} danger />
                            <div className="h-px bg-white/10 my-1" />
                            <MenuSection label="File" />
                            <MenuItem icon={<Save size={16} />} label="Save" onClick={wrap(onSave)} />
                            <MenuItem icon={<FolderOpen size={16} />} label="Load" onClick={wrap(onLoad)} />
                            <MenuItem icon={<Download size={16} />} label="Export PDF" onClick={wrap(onExport)} />
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex gap-1 items-center">
                    {simState === 'running' ? (
                        <ToolBtn icon={<Pause size={16} />} label="Pause" onClick={onPause} accent />
                    ) : (
                        <ToolBtn icon={<Play size={16} />} label="Run" onClick={onRun} accent />
                    )}
                    <ToolBtn icon={<SkipForward size={16} />} label="Step" onClick={onStep} />
                    <ToolBtn icon={<RotateCcw size={16} />} label="Reset" title="Reset simulation (restore fuses, relays, wires)" onClick={onReset} />

                    <Divider />

                    <ToolBtn icon={<Undo2 size={16} />} label="Undo" title="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo} compact />
                    <ToolBtn icon={<Redo2 size={16} />} label="Redo" title="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo} compact />
                    <ToolBtn icon={<FlipHorizontal size={16} />} label="Flip X" title="Flip selected horizontally" onClick={onFlipX} compact />
                    <ToolBtn icon={<FlipVertical size={16} />} label="Flip Y" title="Flip selected vertically" onClick={onFlipY} compact />
                    <ToolBtn icon={<LayoutGrid size={16} />} label="Auto Layout" onClick={onAutoLayout} compact />
                    <ToolBtn icon={<Trash2 size={16} />} label="Clear All" onClick={onClearAll} danger compact />

                    <Divider />

                    <ToolBtn icon={<Save size={16} />} label="Save" title="Save project to a .json file" onClick={onSave} compact />
                    <ToolBtn icon={<FolderOpen size={16} />} label="Load" title="Load a project .json file" onClick={onLoad} compact />
                    <ToolBtn icon={<Download size={16} />} label="Export PDF" onClick={onExport} compact />
                </div>
            )}
        </div>
    );
}

function SimStatus({ simState }: { simState: ToolbarProps['simState'] }) {
    const styles = {
        running: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
        paused: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        stopped: 'bg-slate-800/60 text-slate-400 border-slate-700/60',
    }[simState];
    return (
        <span className={`ml-1 hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${styles}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${simState === 'running' ? 'bg-emerald-400 animate-pulse' : simState === 'paused' ? 'bg-amber-400' : 'bg-slate-500'}`} />
            {simState}
        </span>
    );
}

function Divider() {
    return <div className="w-px h-6 bg-white/10 mx-1.5 self-center rounded-full shrink-0" />;
}

/** `compact` buttons only show their label on very wide screens; the label is always the tooltip */
function ToolBtn({ icon, label, title, onClick, accent, danger, disabled, compact }: {
    icon: React.ReactNode; label: string; title?: string; onClick: () => void;
    accent?: boolean; danger?: boolean; disabled?: boolean; compact?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            title={title ?? label}
            aria-label={label}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap shrink-0 transition-all active:scale-95 disabled:opacity-35 disabled:pointer-events-none ${accent
                ? 'bg-blue-500/90 text-white hover:bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/50'
                : danger
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                }`}
        >
            {icon}
            <span className={compact ? 'hidden min-[1900px]:inline' : 'hidden sm:inline'}>{label}</span>
        </button>
    );
}

function MenuSection({ label }: { label: string }) {
    return <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 pt-1">{label}</div>;
}

function MenuItem({ icon, label, onClick, danger, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`disabled:opacity-35 disabled:pointer-events-none flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-all active:scale-[0.97] ${danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-slate-200 hover:bg-slate-800'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}
