const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function patchNode(file) {
    if (file === 'NodeBase.tsx') return;
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Ensure RotatedHandle is imported from ./NodeBase
    if (!content.includes('RotatedHandle')) {
        // If it already has RotatedContainer, just add it to the list
        if (content.includes('import { RotatedContainer }')) {
            content = content.replace('import { RotatedContainer }', 'import { RotatedContainer, RotatedHandle }');
        } else {
            content = `import { RotatedHandle } from './NodeBase';\n` + content;
        }
    }

    // 2. Revert getRotationPosition(Position.X, rotation) back to Position.X inside the Handle tags
    // because RotatedHandle will do this mapping itself via the 'side' prop.
    // Example: position={getRotationPosition(Position.Left, rotation)} -> side={Position.Left}
    content = content.replace(/position=\{getRotationPosition\((Position\.\w+),\s*rotation\)\}/g, 'side={$1}');

    // 3. Replace <Handle with <RotatedHandle
    // And ensure 'rotation' is passed in.
    content = content.replace(/<(Handle)(\s+[^>]*?)\/?>/g, (match, tag, body) => {
        let newBody = body;
        if (!newBody.includes('rotation=')) {
            newBody += ' rotation={rotation}';
        }
        return `<RotatedHandle ${newBody.trim()} />`;
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Patched ${file}`);
}

fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx')).forEach(patchNode);
console.log('Done mass patching handles.');
