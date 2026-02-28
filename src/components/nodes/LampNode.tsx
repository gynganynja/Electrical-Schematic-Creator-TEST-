import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { Lightbulb } from 'lucide-react';

export function LampNode({ data, selected }: any) {
    const isOn = data?.state?.on || false;
    const brightness = data?.state?.brightness ?? (isOn ? 1 : 0);
    const label = data?.label || 'Lamp';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    // Scale glow and tint based on brightness (0-1)
    const glowAlpha = (brightness * 0.7).toFixed(2);
    const bgAlpha = (brightness * 0.25).toFixed(2);

    return (
        <div
            className={`bg-slate-900 border-2 rounded-full w-16 h-16 flex items-center justify-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isOn ? 'border-yellow-400' : 'border-slate-700 hover:border-slate-500'}`}
            style={isOn ? {
                backgroundColor: `rgba(234,179,8,${bgAlpha})`,
                boxShadow: `0 0 ${Math.round(brightness * 30)}px rgba(250,204,21,${glowAlpha})`
            } : undefined}
        >
            <Lightbulb size={28}
                className={`transition-colors ${isOn ? 'fill-yellow-200' : 'text-slate-500'}`}
                style={isOn ? {
                    color: `rgba(253,224,71,${Math.max(0.4, brightness)})`,
                    filter: `drop-shadow(0 0 ${Math.round(brightness * 10)}px rgba(253,224,71,${glowAlpha}))`
                } : undefined}
            />
            {isOn && brightness < 0.95 && (
                <div className="absolute -top-1 -right-1 bg-amber-900/80 border border-amber-500/40 rounded px-0.5 text-[8px] text-amber-300 font-mono leading-tight">
                    {Math.round(brightness * 100)}%
                </div>
            )}
            <div className="absolute -bottom-6 text-xs font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
