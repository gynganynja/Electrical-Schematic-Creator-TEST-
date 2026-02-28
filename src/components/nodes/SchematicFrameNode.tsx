import { NodeResizer } from '@xyflow/react';
import { LayoutTemplate } from 'lucide-react';
import useStore from '../../store/useStore';

export function SchematicFrameNode({ id, data, selected }: any) {
    const name = data?.params?.frameName ?? 'Sheet 1';
    const description = data?.params?.frameDescription ?? '';
    const updateNodeData = useStore(s => s.updateNodeData);

    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={300}
                minHeight={200}
                handleStyle={{ width: 10, height: 10, borderRadius: 2, background: '#38bdf8', border: '2px solid #0f172a' }}
                lineStyle={{ borderColor: '#38bdf8', borderWidth: 1 }}
            />
            <div
                className={`w-full h-full rounded-xl border-2 transition-all pointer-events-none ${
                    selected
                        ? 'border-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.3),inset_0_0_0_1px_rgba(56,189,248,0.1)]'
                        : 'border-slate-600/60'
                }`}
                style={{ background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(1px)' }}
            >
                {/* Title bar at bottom-left (schematic standard) */}
                <div className="absolute bottom-0 left-0 right-0 flex items-stretch border-t-2 border-inherit rounded-b-xl overflow-hidden pointer-events-auto">
                    {/* Icon block */}
                    <div className="flex items-center justify-center px-3 bg-slate-800/80 border-r border-slate-600/60">
                        <LayoutTemplate size={14} className="text-sky-400" />
                    </div>
                    {/* Name field */}
                    <input
                        className="bg-slate-900/80 text-sky-200 text-sm font-bold px-3 py-1.5 focus:outline-none focus:bg-slate-800 w-40 border-r border-slate-600/60"
                        value={name}
                        placeholder="Sheet name…"
                        onClick={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                        onChange={e => updateNodeData(id, { params: { ...data.params, frameName: e.target.value } } as any)}
                    />
                    {/* Description field */}
                    <input
                        className="bg-slate-900/60 text-slate-400 text-xs px-3 py-1.5 focus:outline-none focus:bg-slate-800 flex-1 min-w-0"
                        value={description}
                        placeholder="Description…"
                        onClick={e => e.stopPropagation()}
                        onMouseDown={e => e.stopPropagation()}
                        onChange={e => updateNodeData(id, { params: { ...data.params, frameDescription: e.target.value } } as any)}
                    />
                    {/* Page indicator */}
                    <div className="flex items-center px-3 bg-slate-800/80 text-[10px] font-mono text-slate-500 border-l border-slate-600/60 whitespace-nowrap">
                        PDF PAGE
                    </div>
                </div>
            </div>
        </>
    );
}
