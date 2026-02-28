const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function stripCounterRotation(file) {
    const filePath = path.join(nodesDir, file);
    let orig = fs.readFileSync(filePath, 'utf-8');
    let content = orig;

    // Pattern to catch: style={{ transform: `rotate(${-rotation}deg)` }}
    // and its variations, like transformOrigin: 'center'

    // Simplest way is to remove the `style={{...}}` blocks that contain `{-rotation}`
    // But we need to be careful not to remove other styles.
    // Let's just replace `rotate(\${-rotation}deg)` with nothing, or remove the style prop if it's the only one.

    // We can replace `style={{ transform: \`rotate(\${-rotation}deg)\` }}` with ``
    content = content.replace(/style=\{\{\s*transform:\s*`rotate\(\$\{-rotation\}deg\)`\s*\}\}/g, '');

    // And for PinRow in NodeBase.tsx:
    // style={{
    //     transform: `rotate(${-rotation}deg)`,
    //     transformOrigin: 'center'
    // }}
    content = content.replace(/style=\{\{\s*transform:\s*`rotate\(\$\{-rotation\}deg\)`,\s*transformOrigin:\s*['"]center['"]\s*\}\}/g, '');

    // In some cases it's just inside a string or inside an existing style tag.
    // Let's specifically target the ones we know about. 
    // AdvanceECUNode, CANTransceiverNode, NodeBase

    if (orig !== content) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Stripped counter-rotation from ${file}`);
    }
}

const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));
files.forEach(stripCounterRotation);

// also check if NodeBase.tsx needs it (it's in the same folder)
console.log('Done stripping.');
