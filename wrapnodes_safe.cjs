const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function wrapNode(file) {
    if (file === 'NodeBase.tsx') return;
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('RotatedContainer')) return;
    if (content.includes('<NodeBody')) return;

    if (!content.includes('RotatedContainer')) {
        content = `import { RotatedContainer } from './NodeBase';\n` + content;
    }

    const regex = /return\s*\(\s*<(div|svg|g)/;
    const match = content.match(regex);
    if (!match) {
        console.log(`Skipped ${file} - no standard return found`);
        return;
    }

    const startIndex = match.index + match[0].indexOf('<' + match[1]);

    content = content.slice(0, startIndex) + '<RotatedContainer rotation={rotation}>\n            ' + content.slice(startIndex);

    const lastIdx = content.lastIndexOf(');');
    if (lastIdx !== -1) {
        content = content.slice(0, lastIdx) + '\n        </RotatedContainer>\n    ' + content.slice(lastIdx);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Wrapped ${file} safely`);
    } else {
        console.log(`Skipped ${file} - no closing ); found`);
    }
}

fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx')).forEach(wrapNode);
console.log('Done safely wrapping.');
