const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function migrateToFlipping(file) {
    if (file === 'NodeBase.tsx') return;
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Update imports if needed (PinRow/NodeBody already there usually)
    // 2. Change rotation variable
    content = content.replace(/const\s+rotation\s*=\s*data\?\.rotation\s*\?\?\s*0;/g, 'const flipX = data?.flipX || false;\n    const flipY = data?.flipY || false;');

    // 3. Update NodeBody
    content = content.replace(/NodeBody\s+rotation=\{rotation\}/g, 'NodeBody flipX={flipX} flipY={flipY}');

    // 4. Update PinRow
    content = content.replace(/PinRow\s+(.*?)\s+rotation=\{rotation\}/g, 'PinRow $1 flipX={flipX} flipY={flipY}');

    // 5. Update RotatedHandle to MirroredHandle
    content = content.replace(/RotatedHandle/g, 'MirroredHandle');
    content = content.replace(/rotation=\{rotation\}/g, 'flipX={flipX} flipY={flipY}');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Migrated ${file}`);
}

fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx')).forEach(migrateToFlipping);
console.log('Done migrating to flipping.');
