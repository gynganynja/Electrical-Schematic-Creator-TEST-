const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function unwrapNode(file) {
    if (file === 'NodeBase.tsx') return;
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (!content.includes('RotatedContainer')) return;

    // Remove import
    content = content.replace(/import\s*\{\s*RotatedContainer\s*\}\s*from\s*['"]\.\/NodeBase['"];?\r?\n*/g, '');

    // The script previously replaced the return block.
    // If it truncated the file, we can't unwrap it perfectly because the code is LOST.
    // WAIT. If the code is LOST, unwrapping will leave it still truncated!
}

unwrapNode('HarnessExitNode.tsx');
