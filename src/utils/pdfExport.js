import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPDF(elementSelector = '.a4-page', fileName = 'Resume.pdf') {
    const element = document.querySelector(elementSelector);
    if (!element) {
        throw new Error('Resume preview element not found');
    }

    // Capture the element as a high-quality canvas
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
    });

    // A4 dimensions in mm
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

    // Handle multi-page if content exceeds one page
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
