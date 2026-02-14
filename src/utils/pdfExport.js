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
            const pageHeight = singlePageHeight;
            const topMargin = 40; // px spacing for new page top (approx 10mm)

            // Get container padding-top to initialize height
            const containerStyle = window.getComputedStyle(clonedElement);
            let currentHeight = parseFloat(containerStyle.paddingTop) || 0;

            // Helper to get element height including margins
            const getOuterHeight = (el) => {
                const style = window.getComputedStyle(el);
                const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                return el.offsetHeight + margin;
            };

            // Process children (Sections)
            const children = Array.from(clonedElement.children);

            // We need to flatten the structure slightly: 
            // The resume has Header -> Sections -> Entries.
            // We want to avoid breaking inside an Entry.
            // If a Section Title is at the bottom, push it to next page.

            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const childHeight = getOuterHeight(child);

                // Helper to check if we need a break
                const checkBreak = (heightIncrement) => {
                    const nextHeight = currentHeight + heightIncrement;
                    const pageIndex = Math.floor(currentHeight / pageHeight);
                    const nextPageLimit = (pageIndex + 1) * pageHeight;

                    // If adding this element crosses the page boundary
                    if (nextHeight > nextPageLimit) {
                        // Calculate how much space is left on current page
                        const spaceLeft = nextPageLimit - currentHeight;

                        // Create spacer
                        const spacer = clonedDoc.createElement('div');
                        // Spacer height = remaining space + top margin for next page
                        spacer.style.height = `${spaceLeft + topMargin}px`;
                        spacer.style.display = 'block';
                        spacer.style.width = '100%';

                        // Insert spacer before the current child
                        child.parentNode.insertBefore(spacer, child);

                        // Update current height by spacer + element
                        currentHeight += (spaceLeft + topMargin) + heightIncrement;
                        return true; // We inserted a break
                    }
                    return false;
                };

                // If it's a section, we might want to check its internal entries
                if (child.classList.contains('resume-section')) {
                    // Check if the TITLE puts us too close to edge?
                    // Or iterate through the section's children (Title + Entries)

                    // Actually, let's treat the section title as an atom, and entries as atoms.
                    // We can't split a section easily if it's one div.
                    // But our CSS structure is: .resume-section > h2, .resume-entry...
                    // So we should iterate the section's children!

                    const sectionChildren = Array.from(child.children);
                    for (let j = 0; j < sectionChildren.length; j++) {
                        const subChild = sectionChildren[j];
                        const subHeight = getOuterHeight(subChild);

                        // If it's a title, we want to make sure we don't orphan it
                        // (Title at bottom, content on next page)
                        // Heuristic: If Title fits but next element doesn't, push Title too?
                        // For simplicity: just check if Title fits.

                        // Note: we are mutating the DOM, so indices might shift if we insert spacers inside section?
                        // Yes. But we are iterating a frozen array 'sectionChildren'.
                        // If we insert a spacer inside the section, it works.

                        if (checkBreak(subHeight)) {
                            // If we broke before this subChild, we are good.
                        } else {
                            currentHeight += subHeight;
                        }
                    }
                    // Add section margin to height
                    // The getOuterHeight calls above might miss the parent section's padding/margin?
                    // .resume-section has no padding, only margin-bottom. 
                    // We should add that margin to currentHeight after processing all children?
                    // It's safer to track cumulative height of atoms.
                } else {
                    // Header or other top-level elements
                    if (checkBreak(childHeight)) {
                        // break inserted
                    } else {
                        currentHeight += childHeight;
                    }
                }
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
