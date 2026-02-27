import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

/**
 * Exports the current React Flow canvas to a PDF file.
 * Captures the viewport and fits it into an A4 page.
 */
export async function exportToPdf(label = 'circuit-schematic') {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) {
        throw new Error('React Flow element not found');
    }

    try {
        // 1. Capture the element as a high-resolution PNG
        // pixelRatio: 3 provides "retina" quality, making lines sharp even when zoomed.
        const dataUrl = await toPng(element, {
            pixelRatio: 3,
            filter: (node) => {
                const cls = (node as HTMLElement).className;
                if (typeof cls === 'string') {
                    return !cls.includes('react-flow__minimap') &&
                        !cls.includes('react-flow__controls') &&
                        !cls.includes('react-flow__panel') &&
                        !cls.includes('react-flow__attribution');
                }
                return true;
            },
            backgroundColor: '#020617', // Match slate-950
        });

        // 2. Create PDF
        // A4 dimensions in mm: 210 x 297
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${label}.pdf`);

        return true;
    } catch (error) {
        console.error('Failed to export PDF:', error);
        throw error;
    }
}
