import React, { useState, useEffect, useRef } from "react";
import DrawArea from "./DrawArea";
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function SinglePage(props) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const drawAreaEl = useRef(null);

  useEffect(() => {
    props.pageChange(pageNumber);    
  }, [pageNumber]);

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  // Function to handle document load success
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // Load PDF
  const { pdf } = props;

  // Memoize options prop
  const options = React.useMemo(() => {
    return {
      workerSrc: "/pdf.worker.js",
      cMapUrl: "cmaps/",
      cMapPacked: true
    };
  }, []);
  return (
    <>
      <div>
        <Document
          file={pdf}
          options={options}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <DrawArea 
            getPaths={props.getPaths} 
            page={pageNumber}
            flag={props.flag} 
            getBounds={props.getBounds} 
            changeFlag={props.changeFlag} 
            cursor={props.cursor} 
            buttonType={props.buttonType} 
            resetButtonType={props.resetButtonType}
            images={props.images} // Pass the images state to DrawArea
            drawAreaRef={drawAreaEl}
          >
            <Page pageNumber={pageNumber} />
          </DrawArea>
        </Document>
      </div>
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
        </p>
        <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-arrow-left"></i>
        </button>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-arrow-right"></i>
        </button>
      </div>
    </>
  );
}
