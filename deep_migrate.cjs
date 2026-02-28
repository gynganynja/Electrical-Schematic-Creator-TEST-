const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function migrateFile(file) {
    if (file === 'NodeBase.tsx') return;
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Ensure flipX/flipY are declared
    if (!content.includes('const flipX')) {
        content = content.replace(/export function .*?\(.*?\) \{/, (match) => {
            return `${match}\n    const flipX = data?.flipX || false;\n    const flipY = data?.flipY || false;`;
        });
    }

    // 2. Remove any remaining rotation declarations
    content = content.replace(/const\s+rotation\s*=\s*.*?;/g, '');

    // 3. Replace RotatedContainer or outer divs with NodeBody
    // This is tricky because some nodes have custom width/height.
    // We'll try to find the outermost div and wrap it or replace it.

    // Replace <RotatedContainer flipX={flipX} flipY={flipY}> ... </RotatedContainer>
    // with <NodeBody flipX={flipX} flipY={flipY} ...> ... </NodeBody>
    content = content.replace(/<RotatedContainer.*?>\s*<div\s+className={`(.*?)}`\s+style=\{\{.*?\}\}>(.*?)<\/div>\s*<\/RotatedContainer>/gs, (match, classes, inner) => {
        // Extract width/height from classes if possible (w-32 h-32)
        const wMatch = classes.match(/w-(\d+)/);
        const hMatch = classes.match(/h-(\d+)/);
        const width = wMatch ? parseInt(wMatch[1]) * 4 : 200; // rough tailwind estimate
        const height = hMatch ? parseInt(hMatch[1]) * 4 : 100;

        // Clean classes (remove w-h-bg-border etc that NodeBody handles)
        let cleanClasses = classes.replace(/w-\d+|h-\d+|bg-\w+-\d+|border-2|rounded-\w+|shadow-\w+|transition-all|relative/g, '').trim();

        // Check if it's rounded-full
        const isFull = classes.includes('rounded-full');
        const extraClass = isFull ? 'rounded-full' : '';

        return `<NodeBody flipX={flipX} flipY={flipY} selected={selected} width={${width}} height={${height}} className="${extraClass} ${cleanClasses}">\n${inner}\n        </NodeBody>`;
    });

    // 4. Update MirroredHandle props
    content = content.replace(/MirroredHandle\s+(.*?)\s+flipX=\{flipX\}\s+flipY=\{flipY\}/g, 'MirroredHandle $1 flipX={flipX} flipY={flipY}');
    // Ensure 'side' is used instead of 'position'
    content = content.replace(/position=\{Position\.(.*?)\}/g, 'side={Position.$1}');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Deep Migrated ${file}`);
}

fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx')).forEach(migrateFile);
console.log('Done deep migration.');
