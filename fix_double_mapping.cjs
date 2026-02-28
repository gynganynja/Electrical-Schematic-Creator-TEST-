const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/components/nodes/RelayNode.tsx',
    'src/components/nodes/PotentiometerNode.tsx',
    'src/components/nodes/GroundNode.tsx',
    'src/components/nodes/ECUNode.tsx',
    'src/components/nodes/BatteryNode.tsx'
];

filesToFix.forEach(relPath => {
    const filePath = path.join(__dirname, relPath);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Revert the variable assignments:
    // const sideTop = getRotationPosition(Position.Top, rotation); -> const sideTop = Position.Top;
    content = content.replace(/const\s+(\w+)\s*=\s*getRotationPosition\((Position\.\w+),\s*rotation\);/g, 'const $1 = $2;');

    // 2. Fix the dynamic style logic in ECUNode power handles and others:
    // style={powerSide === Position.Top || powerSide === Position.Bottom ? { left: '30%' } : { top: '30%' }}
    // We want this to just be its logical unrotated style.
    // If it's a Top pin, it should be { left: '30%' }.

    // For ECUNode specifically:
    if (relPath.includes('ECUNode.tsx')) {
        content = content.replace(/style=\{powerSide\s*===\s*Position\.Top\s*\|\|\s*powerSide\s*===\s*Position\.Bottom\s*\?\s*\{\s*left:\s*['"](\d+%)['"]\s*\}\s*:\s*\{\s*top:\s*['"]\1['"]\s*\}\s*\}/g, "style={{ left: '$1' }}");
        content = content.replace(/style=\{inputSide\s*===\s*Position\.Left\s*\|\|\s*inputSide\s*===\s*Position\.Right\s*\?\s*\{\s*top:\s*[`'"](\$\{stepIdx\}%)[`'"]\s*\}\s*:\s*\{\s*left:\s*[`'"]\1[`'"]\s*\}\s*\}/g, "style={{ top: `$1` }}");
        content = content.replace(/style=\{outputSide\s*===\s*Position\.Left\s*\|\|\s*outputSide\s*===\s*Position\.Right\s*\?\s*\{\s*top:\s*[`'"](\$\{stepIdx\}%)[`'"]\s*\}\s*:\s*\{\s*left:\s*[`'"]\1[`'"]\s*\}\s*\}/g, "style={{ top: `$1` }}");
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed double-mapping in ${relPath}`);
});
