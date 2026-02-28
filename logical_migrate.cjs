const fs = require('fs');
const path = require('path');

const nodesDir = path.join(__dirname, 'src', 'components', 'nodes');

// List of manually fixed nodes to skip
const manuallyFixed = ['ECUNode.tsx', 'AdvancedECUNode.tsx', 'RelayNode.tsx', 'NodeBase.tsx'];

function logicalMigrate(file) {
    if (manuallyFixed.includes(file)) return;
    const filePath = path.join(nodesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Ensure flipX/flipY are available
    if (!content.includes('flipX')) {
        content = content.replace(/export function .*?\(.*?\) \{/, (match) => {
            return `${match}\n    const flipX = data?.flipX || false;\n    const flipY = data?.flipY || false;`;
        });
    }

    // 2. Identify the core "Drawing" and "Handles"
    // Most nodes follow the pattern:
    // <RotatedContainer flipX={flipX} flipY={flipY}>
    //   <div className="..."> ... handles ... </div>
    // </RotatedContainer>

    // We want to transform it to:
    // <NodeBody selected={selected} ...>
    //   <VisualContainer flipX={flipX} flipY={flipY}>
    //      <div className="..."> ... (no handles) ... </div>
    //   </VisualContainer>
    //   <MirroredHandle ... />
    // </NodeBody>

    // Extract handles
    const handleRegex = /<MirroredHandle.*?\/>/g;
    const handles = content.match(handleRegex) || [];
    let cleanInner = content.replace(handleRegex, '');

    // Extract outer container classes
    const outerMatch = cleanInner.match(/<RotatedContainer.*?>\s*<div\s+className={`(.*?)}`\s*(?:style=\{.*?\})?>(.*?)<\/div>\s*<\/RotatedContainer>/s);
    if (outerMatch) {
        const classes = outerMatch[1];
        const innerContent = outerMatch[2];

        // Extract width/height from classes if possible
        const wMatch = classes.match(/w-(\d+)/);
        const hMatch = classes.match(/h-(\d+)/);
        const width = wMatch ? parseInt(wMatch[1]) * 4 : 200;
        const height = hMatch ? parseInt(hMatch[1]) * 4 : 100;

        let nodeClasses = classes.replace(/w-\d+|h-\d+|shadow-\w+|bg-\w+-\d+|border-\d+|rounded-\w+|relative|transition-all/g, '').trim();
        const extraNodeClass = classes.includes('rounded-full') ? 'rounded-full' : '';

        const newTemplate = `
        <NodeBody selected={selected} width={${width}} height={${height}} className="${extraNodeClass} ${nodeClasses}">
            <VisualContainer flipX={flipX} flipY={flipY}>
                <div className="w-full h-full relative flex flex-col items-center justify-center">
                    ${innerContent.trim()}
                </div>
            </VisualContainer>
            ${handles.join('\n            ')}
        </NodeBody>`;

        content = content.replace(/<RotatedContainer.*?>.*?<\/RotatedContainer>/s, newTemplate);
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Logically Migrated ${file}`);
}

fs.readdirSync(nodesDir).filter(f => f.endsWith('.tsx')).forEach(logicalMigrate);
console.log('Done logical migration.');
