import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, RotateCw, Save, FolderOpen, Download, Trash2, LayoutGrid } from 'lucide-react';

interface ToolbarProps {
    simState: 'stopped' | 'running' | 'paused';
    onRun: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onSave: () => void;
    onLoad: () => void;
    onExport: () => void;
    onRotate: () => void;
    onClearAll: () => void;
    onAutoLayout: () => void;
}

export function Toolbar({ simState, onRun, onPause, onStep, onReset, onSave, onLoad, onExport, onRotate, onClearAll, onAutoLayout }: ToolbarProps) {
    return (
        <div className="h-14 border-b border-white/10 bg-slate-900/60 backdrop-blur-md flex items-center px-6 justify-between shrink-0 shadow-lg relative">
            <h1 className="font-bold text-lg text-slate-100 flex items-center gap-2 drop-shadow-sm tracking-tight">
                <span className="text-blue-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">⚡</span>
                Circuit Generator
            </h1>

            <div className="flex gap-1">
                {/* Simulation Controls */}
                {simState === 'running' ? (
                    <ToolBtn icon={<Pause size={16} />} label="Pause" onClick={onPause} accent />
                ) : (
                    <ToolBtn icon={<Play size={16} />} label="Run" onClick={onRun} accent />
                )}
                <ToolBtn icon={<SkipForward size={16} />} label="Step" onClick={onStep} />
                <ToolBtn icon={<RotateCcw size={16} />} label="Reset Sim" onClick={onReset} />

                <div className="w-px h-6 bg-white/10 mx-2 self-center rounded-full" />

                {/* Edit Controls */}
                <ToolBtn icon={<RotateCw size={16} />} label="Rotate (R)" onClick={onRotate} />
                <ToolBtn icon={<LayoutGrid size={16} />} label="Auto Layout" onClick={onAutoLayout} />
                <ToolBtn icon={<Trash2 size={16} />} label="Clear All" onClick={onClearAll} danger />

                <div className="w-px h-6 bg-white/10 mx-2 self-center rounded-full" />

                {/* File Controls */}
                <ToolBtn icon={<Save size={16} />} label="Save" onClick={onSave} />
                <ToolBtn icon={<FolderOpen size={16} />} label="Load" onClick={onLoad} />
                <ToolBtn icon={<Download size={16} />} label="Export" onClick={onExport} />
            </div>
        </div>
    );
}

function ToolBtn({ icon, label, onClick, accent, danger }: { icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean; danger?: boolean }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${accent
                ? 'bg-blue-500/90 text-white hover:bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/50'
                : danger
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
