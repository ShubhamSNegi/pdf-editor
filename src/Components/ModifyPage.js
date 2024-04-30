import { useEffect } from 'react';
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
                    // Embed image into PDF document
                    let image = await pdfDoc.embedJpg(res.image);
                    // Assuming image is JPEG format
                    const { width, height } = image.scale(0.5);
                
                    if (typeof props.bounds.y !== 'number' || isNaN(props.bounds.y)) {
                        throw new Error(`Invalid value for props.bounds.y: ${props.bounds.y}`);
                    }
                    console.log(res);
                    const x = res.x - props.bounds.x;
                    const y = props.bounds.y - res.y;
                    pages[pageIdx].drawImage(image, {
                        x: x,
                        y: y,
                        width,
                        height,
                        zIndex:2
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
        }
    }

    return null; // ModifyPage component doesn't render anything
}

export default ModifyPage;
