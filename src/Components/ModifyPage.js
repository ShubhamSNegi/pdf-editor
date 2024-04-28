import React, { useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function ModifyPage(props) {
    useEffect(() => {
        if (props.buttonType === "download") {
            modifyPdf();
            props.resetButtonType();
        }
    }, [props.buttonType, props.pdf, props.result, props.bounds]);

    async function modifyPdf() {
        try {
            let pdfBytes;
            // Load PDF bytes from different sources
            if (typeof props.pdf === 'string') {
                // If PDF is provided as URL
                const response = await fetch(props.pdf);
                if (!response.ok) throw new Error('Failed to fetch PDF');
                pdfBytes = await response.arrayBuffer();
            } else if (props.pdf instanceof Blob || props.pdf instanceof File) {
                // If PDF is provided as a Blob or File object
                pdfBytes = await props.pdf.arrayBuffer();
            } else {
                throw new Error('Invalid PDF source');
            }

            // Load PDF document
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const textSize = 16;

            // Modify PDF based on results
            props.result.forEach(async (res) => {
                const pageIdx = res.page - 1;
                if (res.type === "text") {
                    pages[pageIdx].drawText(res.text, {
                        x: res.x - props.bounds.x,
                        y: props.bounds.y - res.y - textSize, // Adjust y position based on text size
                        size: textSize,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                        maxWidth: res.width, // Use provided width
                        lineHeight: res.lineHeight || 15, // Use provided lineHeight or default
                    });
                }
                if (res.type === "image") {
                    // Fetch image bytes
                    const response = await fetch(res.image);
                    console.log(res);
                    if (!response.ok) throw new Error('Failed to fetch image');
                    const imageBytes = await response.arrayBuffer();
                
                    // Embed image into PDF document
                    const image = await pdfDoc.embedJpg(imageBytes); // Assuming image is JPEG format
                    const dimensions = image.scale(0.5);
                
                    // Ensure res.x and props.bounds.x are valid numbers
                    if (typeof res.x !== 'number' || isNaN(res.x)) {
                        throw new Error(`Invalid value for res.x: ${res.x}`);
                    }
                
                    if (typeof props.bounds.x !== 'number' || isNaN(props.bounds.x)) {
                        throw new Error(`Invalid value for props.bounds.x: ${props.bounds.x}`);
                    }
                
                    // Ensure res.y and props.bounds.y are valid numbers
                    if (typeof res.y !== 'number' || isNaN(res.y)) {
                        throw new Error(`Invalid value for res.y: ${res.y}`);
                    }
                
                    if (typeof props.bounds.y !== 'number' || isNaN(props.bounds.y)) {
                        throw new Error(`Invalid value for props.bounds.y: ${props.bounds.y}`);
                    }
                
                    // Calculate image position (x, y)
                    const x = res.x - props.bounds.x;
                    const y = props.bounds.y - res.y;
                    console.log("Image position (x, y):", x, y);
                
                    // Draw image onto PDF page
                    pages[pageIdx].drawImage(image, {
                        x: x,
                        y: y,
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
            link.download = "modified_pdf.pdf";
            link.click();
        } catch (error) {
            console.error("Error modifying PDF:", error);
            // Handle error gracefully, display a message to the user, etc.
        }
    }

    return null; // ModifyPage component doesn't render anything
}

export default ModifyPage;
