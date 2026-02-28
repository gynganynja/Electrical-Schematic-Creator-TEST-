const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

function patchFile(file) {
    const filePath = path.join(nodesDir, file);
    let orig = fs.readFileSync(filePath, 'utf-8');
    let content = orig;

    // 1. Ensure import of getRotationPosition
    if (!content.includes('getRotationPosition')) {
        // Find last import
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine + 1) +
                `import { getRotationPosition } from '../../utils/rotation';\n` +
                content.slice(endOfLine + 1);
        } else {
            content = `import { getRotationPosition } from '../../utils/rotation';\n` + content;
        }
    }

    // 2. Insert rotation const inside the component function
    // Look for `export function ComponentName({ data...` or `export const ComponentName = ({ data...`
    const functionMatch = content.match(/export (function \w+|const \w+ = )\(\{[^}]*data[^}]*\}\)/);
    if (!content.includes('const rotation =')) {
        if (functionMatch) {
            const searchStr = functionMatch[0];
            const idx = content.indexOf(searchStr) + searchStr.length;
            // Now find the opening brace `{` after idx, if it wasn't already matched
            const bodyStart = content.indexOf('{', idx - 10);
            // Better logic: just inject after the first '{' following the export statement.
            // Wait, standard React components have the block `{` already matched or shortly after.
            // Let's just find the `return (` and insert right before it.
            const returnIdx = content.indexOf('return (', functionMatch.index);
            if (returnIdx !== -1) {
                content = content.slice(0, returnIdx) +
                    `    const rotation = (data?.rotationSteps || 0) * 90;\n` +
                    content.slice(returnIdx);
            }
        } else {
            // Some components might have `({ data, selected }: any)`
            const anyMatch = content.match(/export function \w+\([^)]*data[^)]*\)\s*\{/);
            if (anyMatch) {
                content = content.replace(anyMatch[0], anyMatch[0] + `\n    const rotation = (data?.rotationSteps || 0) * 90;`);
            }
        }
    }

    // 3. Patch Position.Left to getRotationPosition(Position.Left, rotation)
    // Be careful not to patch already patched ones
    content = content.replace(/position=\{?(Position\.(Left|Right|Top|Bottom))\}?(?!,\s*rotation)/g, 'position={getRotationPosition($1, rotation)}');
    content = content.replace(/position=\{?['"](left|right|top|bottom)['"]\}?(?!,\s*rotation)/gi, (match, p1) => {
        let enumVal = p1.charAt(0).toUpperCase() + p1.slice(1).toLowerCase();
        return `position={getRotationPosition(Position.${enumVal}, rotation)}`;
    });

    // 4. Transform: add rotate(${rotation}deg) to the main wrapper if not using NodeBody
    if (!content.includes('<NodeBody') && !content.includes('rotate(')) {
        // Find the outermost style={{...}} after return (
        let returnIdx = content.indexOf('return (');
        if (returnIdx !== -1) {
            let styleIdx = content.indexOf('style={{', returnIdx);
            if (styleIdx !== -1 && styleIdx < returnIdx + 500) { // arbitrary bound so we don't catch nested elements
                // Inject rotate
                content = content.replace(/style=\{\{([^}]*)\}\}/, 'style={{$1, transform: `rotate(${rotation}deg)`, transformOrigin: "center"}}');
            } else {
                // There is no style. Let's look for className of the first <div>
                const firstDivIdx = content.indexOf('<div', returnIdx);
                if (firstDivIdx !== -1 && firstDivIdx < returnIdx + 100) {
                    content = content.replace(/<div([^>]*)>/, '<div$1 style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}>');
                }
            }
        }
    }

    if (orig !== content) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Patched ${file}`);
    }
}

const files = fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx'));
files.forEach(patchFile);
console.log('Done scanning.');
