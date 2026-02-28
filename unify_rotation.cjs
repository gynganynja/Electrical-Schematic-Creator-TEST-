const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function unifyRotation(file) {
    if (file === 'NodeBase.tsx') return;
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Change const rotation = (data?.rotationSteps || 0) * 90; -> const rotation = data?.rotation ?? 0;
    content = content.replace(/const\s+rotation\s*=\s*\(data\?\.rotationSteps\s*\|\|\s*0\)\s*\*\s*90;/g, 'const rotation = data?.rotation ?? 0;');

    // 2. Remove rotationSteps from dependencies if found inuseEffect
    content = content.replace(/rotationSteps/g, 'rotation');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Unified rotation in ${file}`);
}

fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx')).forEach(unifyRotation);
console.log('Done unifying rotation.');
