const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function wrapNode(file) {
    if (file === 'NodeBase.tsx') return;

    const filePath = path.join(nodesDir, file);
    let orig = fs.readFileSync(filePath, 'utf-8');
    let content = orig;

    if (content.includes('RotatedContainer')) return;
    if (content.includes('<NodeBody')) return;

    if (!content.includes('RotatedContainer')) {
        content = `import { RotatedContainer } from './NodeBase';\n` + content;
    }

    const returnMatch = content.match(/return\s*\(\s*(<div[\s\S]*?)\);\s*\}/);
    if (returnMatch) {
        const innerContent = returnMatch[1];
        const newReturn = `return (\n        <RotatedContainer rotation={rotation}>\n            ${innerContent}\n        </RotatedContainer>\n    );\n}`;
        content = content.replace(returnMatch[0], newReturn);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Wrapped ${file}`);
    } else {
        console.log(`Skipped ${file} - no matching return syntax`);
    }
}

fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx')).forEach(wrapNode);
console.log('Done wrapping.');
