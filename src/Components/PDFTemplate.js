import React from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const PDFTemplate = ({ data }) => {
  const generatePDF = async () => {
    const { buildingInformation, images, text } = data; // Destructure images and text from data prop
    console.log("inside function")
    console.log("inside function", data)

    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Add first page with two images
    const page1 = pdfDoc.addPage([500, 600]);
    page1.setFont(timesRomanFont);
    // await Promise.all(images.slice(0, 2).map(async (jpgUrl, index) => {
    //   const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());
    //   const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
    //   const dims = jpgImage.scale(0.5); // Scale the image if necessary
    //   page1.drawImage(jpgImage, {
    //     x: 50,
    //     y: 50 + index * 200, // Adjust the position based on the image index
    //     width: dims.width,
    //     height: dims.height
    //   });
    // }));
    await Promise.all(images.slice(0, 2).map(async (imageData, index) => {
      const jpgImageBytes = imageData.data;
      const jpgImage = await pdfDoc.embedPng(jpgImageBytes);
      const dims = jpgImage.scale(0.5);
      page1.drawImage(jpgImage, {
        x: 100,
        y: 350 - index * 150,
        width: dims.width,
        height: dims.height
      });
    }));

    const page2 = pdfDoc.addPage([500, 600]);
    page2.setFont(timesRomanFont);
    
    // Draw the title "Building Information" at the top
    const titleWidth = timesRomanFont.widthOfTextAtSize(text.title, 16);
    const titleY = page2.getHeight() - 50; // Adjust the margin from the top as needed
    page2.drawText(text.title, { x: (page2.getWidth() - titleWidth) / 2, y: titleY, size: 16 });
    
    // Add space below the title
    const spaceY = titleY - 20; // Adjust the value as needed for the desired space
    page2.drawText(' ', { x: 50, y: spaceY, size: 12 });
    
    // Calculate the maximum width of keys and values
    let maxKeyWidth = 0;
    let maxValueWidth = 0;
    Object.entries(buildingInformation).forEach(([key, value]) => {
      const keyWidth = timesRomanFont.widthOfTextAtSize(key, 12);
      const valueWidth = timesRomanFont.widthOfTextAtSize(value, 12);
      maxKeyWidth = Math.max(maxKeyWidth, keyWidth);
      maxValueWidth = Math.max(maxValueWidth, valueWidth);
    });
    
    // Determine the starting positions for keys and values
    const keyStartX = 50;
    const valueStartX = page2.getWidth() - maxValueWidth - 50;
    
    // Draw all key-value pairs below the title and space
    Object.entries(buildingInformation).forEach(([key, value], index) => {
      const y = spaceY - (index + 1) * 20; // Calculate y coordinate with uniform spacing
      
      // Draw key with underline
      page2.drawText(key, { x: keyStartX, y, size: 12 });
      page2.drawLine({
        start: { x: keyStartX, y: y - 2 },
        end: { x: keyStartX + maxKeyWidth, y: y - 2 },
        thickness: 1,
      });
      
      // Draw value with underline
      page2.drawText(value, { x: valueStartX, y, size: 12 });
      page2.drawLine({
        start: { x: valueStartX, y: y - 2 },
        end: { x: valueStartX + maxValueWidth, y: y - 2 },
        thickness: 1,
      });
    });

    const page3 = pdfDoc.addPage([500, 600]);
    page3.setFont(timesRomanFont);
    // Add third page with two images
    await Promise.all(images.slice(0, 2).map(async (imageData, index) => {
      const jpgImageBytes = imageData.data;
      const jpgImage = await pdfDoc.embedPng(jpgImageBytes);
      const dims = jpgImage.scale(0.5);
      page3.drawImage(jpgImage, {
        x: 100,
        y: 350 - index * 150,
        width: dims.width,
        height: dims.height
      });
    }));
    const footerImageBytes = await fetch(process.env.PUBLIC_URL + '/footer.png').then((res) => res.arrayBuffer());
    const footerImage = await pdfDoc.embedPng(footerImageBytes);
    
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const currentPage = pdfDoc.getPage(i);
      const footerX = 10; // Adjust as needed
      const footerY = 10; // Adjust as needed
      const footerWidth = 480; // Adjust as needed
      const footerHeight = 70; // Adjust as needed
      currentPage.drawImage(footerImage, {
        x: footerX,
        y: footerY,
        width: footerWidth,
        height: footerHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();

    // Trigger PDF download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated_pdf.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  );
};

export default PDFTemplate;
