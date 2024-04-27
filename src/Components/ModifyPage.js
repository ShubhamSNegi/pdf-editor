import React, { useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function ModifyPage(props) {
    useEffect(() => {
        if (props.buttonType === "download") {
            modifyPdf();
            props.resetButtonType();
        }
    }, [props.buttonType]);

    async function modifyPdf() {
        try {
            let pdfUrl;
            if (typeof props.pdf === 'string') {
                pdfUrl = props.pdf;
            } else if (typeof props.pdf === 'object' || props.pdf instanceof File) {
                pdfUrl = URL.createObjectURL(props.pdf);
            } else {
                throw new Error('Invalid PDF URL');
            }
            
            // Fetch the PDF bytes
            const response = await fetch(pdfUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch PDF');
            }
            const pdfBytes = await response.arrayBuffer();
    
            // Load PDF document
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const textSize = 16;
    
            // Modify PDF based on results
            props.result.forEach(async (res) => {
                if (res.type === "text") {
                    pages[res.page - 1].drawText(res.text, {
                        x: res.ref.current.offsetLeft - props.bounds.x,
                        y: props.bounds.y - res.ref.current.offsetTop - 17,
                        size: textSize,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                        maxWidth: res.ref.current.getBoundingClientRect().width,
                        lineHeight: 15
                    });
                }
                if (res.type === "freehand") {
                    const pathData = "M " + res.arr.map(p => `${p.get('x')},${p.get('y')}`).join(" L ");
                    pages[res.page - 1].moveTo(0, pages[0].getHeight());
                    pages[res.page - 1].drawSvgPath(pathData, { borderColor: rgb(0, 0, 0) });
                }
                if (res.type === "image") {
                    const imageBytes = atob(res.image.split(',')[1]);
                    const image = await pdfDoc.embedPng(imageBytes);
                    const page = pages[res.page - 1];
                    const dimensions = image.scale(0.5);
                    page.drawImage(image, {
                        x: res.x - props.bounds.x,
                        y: props.bounds.y - res.y, // Adjust y position based on user input
                        width: dimensions.width,
                        height: dimensions.height,
                    });
                }
            });
    
            // Save modified PDF
            const modifiedPdfBytes = await pdfDoc.save();
    
            // Create a download link for the modified PDF
            const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            const fileName = "modified_pdf.pdf";
            link.download = fileName;
            link.click();
        } catch (error) {
            console.error("Error modifying PDF:", error);
            // Handle error gracefully, display a message to the user, etc.
        }
    }
    return null; // ModifyPage component doesn't render anything
}

export default ModifyPage;
