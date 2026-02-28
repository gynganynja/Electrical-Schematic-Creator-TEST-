const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function auditNode(file) {
    const filePath = path.join(nodesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const issues = [];

    // Check if it uses Handle
    if (!content.includes('<Handle')) {
        return issues; // Not a standard node, maybe just a wrapper
    }

    // Check if it imports getRotationPosition or uses NodeBase
    if (!content.includes('getRotationPosition') && !content.includes('NodeBase') && !content.includes('PinRow')) {
        issues.push('Missing getRotationPosition or PinRow import');
    }

    // Check for raw positions in Handle
    const rawPosRegex = /position=\{?(Position\.(Left|Right|Top|Bottom)|['"](left|right|top|bottom)['"])/g;
    let match;
    while ((match = rawPosRegex.exec(content)) !== null) {
        // If it's a PinRow it doesn't matter, PinRow handles it. But here we are checking <Handle
        // wait, let's just check lines with <Handle
    }

    const lines = content.split('\n');
    let inHandle = false;
    let handleUsesRawPos = false;

    for (const [i, line] of Object.entries(lines)) {
        if (line.includes('<Handle')) {
            inHandle = true;
            handleUsesRawPos = false;
        }
        if (inHandle) {
            if (line.match(/position=\{?(Position\.(Left|Right|Top|Bottom)|['"](left|right|top|bottom)['"])/)) {
                handleUsesRawPos = true;
                issues.push(`Line ${parseInt(i) + 1}: Static Handle position found: ${line.trim()}`);
            }
        }
        if (inHandle && line.includes('/>')) {
            inHandle = false;
        }
        if (inHandle && line.includes('</Handle>')) {
            inHandle = false;
        }
    }

    return issues;
}

const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));
const report = {};

files.forEach(file => {
    const issues = auditNode(file);
    if (issues.length > 0) {
        report[file] = issues;
    }
});

console.log(JSON.stringify(report, null, 2));
