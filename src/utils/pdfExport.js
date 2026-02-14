import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPDF(elementSelector = '.a4-page', fileName = 'Resume.pdf') {
    const element = document.querySelector(elementSelector);
    if (!element) {
        throw new Error('Resume preview element not found');
    }

    // A4 dimensions in px (approx at 96 DPI, but we use ratios)
    // 210mm width, 297mm height
    // We use the element's scrollWidth to determine the ratio
    const elementWidth = element.scrollWidth;
    const pageHeightRatio = 297 / 210;
    const singlePageHeight = elementWidth * pageHeightRatio;

    // Use html2canvas with onclone to manipulate the DOM before capture
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector(elementSelector);
            if (!clonedElement) return;

            // Page break logic
            const pageHeight = singlePageHeight; // px equivalents of A4 height
            const topMargin = 50; // px spacing for new page top (approx 13mm)

            // Helper to get raw execution-time height/top
            const getBox = (el) => {
                // We use offsetTop relative to the offsetParent (which should be the page container or similar)
                // Since this is a clone in a vacuum, offsetTop is usually reliable relative to the nearest positioned ancestor.
                return {
                    top: el.offsetTop,
                    height: el.offsetHeight,
                    bottom: el.offsetTop + el.offsetHeight
                };
            };

            // Recursive function to handle breaks
            const processElement = (el) => {
                // If this is a text node, skip (shouldn't happen with element children iteration)
                if (el.nodeType !== 1) return;

                // Check if this element effectively needs to be on a new page
                const { top, bottom } = getBox(el);

                const startPage = Math.floor(top / pageHeight);
                const endPage = Math.floor(bottom / pageHeight);

                // If it fits entirely on one page, we are good.
                if (startPage === endPage) return;

                // It crosses a boundary.
                const children = Array.from(el.children);

                // If it has children and IS NOT the contact line (which should stay together), try to break inside.
                if (children.length > 0 && !el.classList.contains('resume-contact-line')) {
                    for (const child of children) {
                        processElement(child);
                    }
                } else {
                    // It's a leaf or atomic component. Push it to the next page.
                    const nextPageStart = (startPage + 1) * pageHeight;
                    const targetTop = nextPageStart + topMargin;
                    const spacerHeight = targetTop - top;

                    if (spacerHeight > 0) {
                        const spacer = clonedDoc.createElement('div');
                        spacer.className = 'print-spacer';
                        spacer.style.height = `${spacerHeight}px`;
                        spacer.style.display = 'block';
                        spacer.style.width = '100%';

                        // Insert before this element
                        if (el.parentNode) {
                            el.parentNode.insertBefore(spacer, el);
                        }
                    }
                }
            };

            // Start processing from top level children of the page
            const rootChildren = Array.from(clonedElement.children);
            for (const child of rootChildren) {
                processElement(child);
            }
        }
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save(fileName);
}
