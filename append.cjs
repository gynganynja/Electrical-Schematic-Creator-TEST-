const fs = require('fs');
const content = fs.readFileSync('src/components/nodes/NodeBase.tsx', 'utf8');

const toAppend = `
export const RotatedContainer = ({ rotation, children }: { rotation: number, children: React.ReactNode }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        if (!ref.current) return;
        const child = ref.current.firstElementChild as HTMLElement;
        if (!child) return;

        const w = child.offsetWidth;
        const h = child.offsetHeight;

        if (w === 0 || h === 0) return;

        const isVert = rotation === 90 || rotation === 270;
        ref.current.style.width = \`\${isVert ? h : w}px\`;
        ref.current.style.height = \`\${isVert ? w : h}px\`;
    }, [rotation]);

    return (
        <div ref={ref} className="relative flex items-center justify-center">
            {children}
        </div>
    );
};
`;

if (!content.includes('export const RotatedContainer')) {
    fs.writeFileSync('src/components/nodes/NodeBase.tsx', content + toAppend);
}
