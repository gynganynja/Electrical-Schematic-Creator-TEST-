const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function purgeRotation(file) {
    if (file === 'NodeBase.tsx') return;
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Remove style transforms that use rotation
    content = content.replace(/style=\{\{\s*transform:\s*`rotate\(\$\{rotation\}deg\)`.*?\s*\}\}/g, '');
    content = content.replace(/style=\{\{\s*transform:\s*`rotate\(\$\{data\?\.rotation\s*\|\|\s*0\}deg\)`\s*\}\}/g, '');

    // Catch single quotes too
    content = content.replace(/style=\{\{\s*transform:\s*'rotate\(\$\{rotation\}deg\)'.*?\s*\}\}/g, '');

    // 2. Ensure MirroredHandle is used and has flipX/Y
    // (Already handled mostly, but let's be sure)
    content = content.replace(/RotatedHandle/g, 'MirroredHandle');

    // 3. Remove unused getRotationPosition import if found
    content = content.replace(/import\s+\{\s*getRotationPosition\s*\}\s+from\s+'.*?rotation';/g, '');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Purged ${file}`);
}

fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx')).forEach(purgeRotation);
console.log('Done purging rotation.');
