import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

const UI_FILTER = (node: Element) => {
    const cls = (node as HTMLElement).className;
    if (typeof cls !== 'string') return true;
    return !cls.includes('react-flow__minimap') &&
        !cls.includes('react-flow__controls') &&
        !cls.includes('react-flow__panel') &&
        !cls.includes('react-flow__attribution');
};

const PIXEL_RATIO = 3;
const BG = '#020617';
const PADDING_PX = 24; // flow-space padding around each frame crop

/** Crop a section of a full-canvas image onto a new offscreen canvas */
function cropImage(
    src: HTMLImageElement,
    sx: number, sy: number, sw: number, sh: number,
    dw: number, dh: number,
): string {
    const c = document.createElement('canvas');
    c.width = dw;
    c.height = dh;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, dw, dh);
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, dw, dh);
    return c.toDataURL('image/png');
}

/**
 * Exports the circuit to PDF.
 * - If schematic_frame nodes exist: each frame becomes its own page (sorted by name).
 * - Otherwise: exports the full visible canvas as a single page.
 */
export async function exportToPdf(label = 'circuit-schematic') {
    // ── locate elements ───────────────────────────────────────────────────────
    // Use the renderer pane (pure canvas area, no palette/inspector sidebars)
    const renderer = (
        document.querySelector('.react-flow__renderer') ??
        document.querySelector('.react-flow__pane') ??
        document.querySelector('.react-flow')
    ) as HTMLElement | null;
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null;
    if (!renderer || !viewport) throw new Error('React Flow element not found');

    // ── read viewport transform: matrix(scale,0,0,scale,panX,panY) ───────────
    const xfStyle = window.getComputedStyle(viewport).transform;
    let scale = 1, panX = 0, panY = 0;
    const m = xfStyle.match(/matrix\(([^)]+)\)/);
    if (m) {
        const parts = m[1].split(',').map(Number);
        scale = parts[0];
        panX  = parts[4];
        panY  = parts[5];
    }

    // ── collect schematic_frame nodes from the store ─────────────────────────
    const storeState = (window as any).__circuitStore?.getState?.();
    const frameNodes: Array<{ id: string; x: number; y: number; w: number; h: number; name: string; desc: string }> = [];

    if (storeState?.nodes) {
        for (const n of storeState.nodes) {
            if ((n.data as any)?.type !== 'schematic_frame') continue;
            const w = n.measured?.width  ?? n.style?.width  ?? 800;
            const h = n.measured?.height ?? n.style?.height ?? 500;
            frameNodes.push({
                id: n.id,
                x: n.position.x,
                y: n.position.y,
                w: typeof w === 'string' ? parseFloat(w) : w,
                h: typeof h === 'string' ? parseFloat(h) : h,
                name: (n.data as any)?.params?.frameName ?? 'Sheet',
                desc: (n.data as any)?.params?.frameDescription ?? '',
            });
        }
    }

    frameNodes.sort((a, b) => a.name.localeCompare(b.name));

    // ── capture the canvas area only ─────────────────────────────────────────
    const fullDataUrl = await toPng(renderer, {
        pixelRatio: PIXEL_RATIO,
        filter: UI_FILTER,
        backgroundColor: BG,
    });

    const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = fullDataUrl;
    });

    // ── build PDF ─────────────────────────────────────────────────────────────
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    if (frameNodes.length === 0) {
        const aspectRatio = img.width / img.height;
        const fitH = pdfW / aspectRatio;
        if (fitH <= pdfH) {
            pdf.addImage(fullDataUrl, 'PNG', 0, (pdfH - fitH) / 2, pdfW, fitH);
        } else {
            const fitW = pdfH * aspectRatio;
            pdf.addImage(fullDataUrl, 'PNG', (pdfW - fitW) / 2, 0, fitW, pdfH);
        }
    } else {
        // ── Frame-based export ────────────────────────────────────────────────
        // The renderer element's bounding rect tells us where the canvas starts on screen.
        // panX/panY are already relative to the renderer's top-left, so no offset subtraction needed —
        // the viewport transform positions nodes within the renderer.
        frameNodes.forEach((frame, idx) => {
            if (idx > 0) pdf.addPage('a4', 'landscape');

            // Flow-space → renderer-local screen pixels
            // flow coord → screen = coord * scale + pan
            const sx = (frame.x - PADDING_PX) * scale + panX;
            const sy = (frame.y - PADDING_PX) * scale + panY;
            const sw = (frame.w + PADDING_PX * 2) * scale;
            const sh = (frame.h + PADDING_PX * 2) * scale;

            // Screen pixels → captured image pixels (toPng captures at PIXEL_RATIO × CSS pixels)
            const imgX = sx * PIXEL_RATIO;
            const imgY = sy * PIXEL_RATIO;
            const imgW = sw * PIXEL_RATIO;
            const imgH = sh * PIXEL_RATIO;

            // Clamp to image bounds
            const csx = Math.max(0, Math.round(imgX));
            const csy = Math.max(0, Math.round(imgY));
            const cex = Math.min(Math.round(imgX + imgW), img.width);
            const cey = Math.min(Math.round(imgY + imgH), img.height);
            const csw = cex - csx;
            const csh = cey - csy;

            if (csw <= 0 || csh <= 0) return;

            // Fit cropped region into PDF page (with margin + title bar)
            const mmPad = 8;
            const availW = pdfW - mmPad * 2;
            const availH = pdfH - mmPad * 2 - 18;
            const aspect = csw / csh;
            let drawW = availW;
            let drawH = drawW / aspect;
            if (drawH > availH) { drawH = availH; drawW = drawH * aspect; }
            const xOff = mmPad + (availW - drawW) / 2;
            const yOff = mmPad;

            const cropped = cropImage(img, csx, csy, csw, csh, csw, csh);
            pdf.addImage(cropped, 'PNG', xOff, yOff, drawW, drawH);

            // ── Title block at bottom ────────────────────────────────────────
            const tbY = pdfH - 16;
            pdf.setFillColor(2, 6, 23); // slate-950
            pdf.rect(0, tbY, pdfW, 16, 'F');
            pdf.setDrawColor(51, 65, 85); // slate-700
            pdf.line(0, tbY, pdfW, tbY);

            // Sheet name
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.setTextColor(186, 230, 253); // sky-200
            pdf.text(frame.name, 8, tbY + 6.5);

            // Description
            if (frame.desc) {
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.setTextColor(100, 116, 139); // slate-500
                pdf.text(frame.desc, 8, tbY + 12);
            }

            // Page number (right side)
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.text(`Page ${idx + 1} of ${frameNodes.length}`, pdfW - 8, tbY + 6.5, { align: 'right' });

            // Project label
            pdf.setFontSize(7);
            pdf.text(label, pdfW - 8, tbY + 12, { align: 'right' });
        });
    }

    pdf.save(`${label}.pdf`);
    return true;
}
