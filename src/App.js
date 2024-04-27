import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SinglePage from './Components/SinglePage';
import ModifyPage from './Components/ModifyPage';
import AutoTextArea from './Components/AutoTextArea';
import FileUploader from './Components/FileUploader';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { PDFDocument, PageSizes } from 'pdf-lib';
import ImageUploader from './Components/ImageUploader';

export default function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [result, setResult] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [redoStack, setRedoStack] = useState([]);
  const [flag, setFlag] = useState("");
  const [bounds, setBounds] = useState({});
  const [isText, setIsText] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const tempRef = useRef(null);
  const [fileUploaded, setFileUploaded] = useState(false);

  useEffect(() => {
    if (isText) {
      setIsText(false);
    }
  }, [result]);

  // Function to handle file upload
  const handleFileUpload = (files) => {
    const file = files[0];
    setPdfFile(file);
    setFileUploaded(true);
  };

  // Function to handle image upload
  const handleImageUpload = (imageDataUrl) => {
    setResult([
      ...result,
      { id: generateKey(), x: 100, y: 100, image: imageDataUrl, page: pageNumber, type: "image" },
    ]);
  };

  // Keep track of current page number
  const pageChange = (num) => {
    setPageNumber(num);
  };

  // Function to add text in PDF
  const addText = () => {
    // Flag to change cursor if text
    setIsText(true);
    document.getElementById("drawArea").addEventListener("click", (e) => {
      e.preventDefault();
      setResult((result) => [
        ...result,
        { id: generateKey(e.pageX), x: e.pageX, y: e.pageY - 10, text: "", page: pageNumber, type: "text", ref: tempRef },
      ]);
    }, { once: true });
  };

  // Undo function for both line and text
  const undo = () => {
    let temp = result.pop();
    if (temp) {
      if (temp.type === "freehand") {
        // Flag for DrawArea reference
        setFlag("undo");
      }
      setRedoStack((stack) => [...stack, temp]);
      setResult(result);
    }
  };

  // Flag for DrawArea reference
  const changeFlag = () => {
    setFlag("");
  };

  // Redo functionality
  const redo = () => {
    let top = redoStack.pop();
    if (top) {
      if (top.type === "freehand") {
        // Flag for DrawArea reference
        setFlag("redo");
      }
      setResult((res) => [...res, top]);
    }
  };

  const getPaths = (el) => {
    setResult((res) => [...res, el]);
  };

  const getBounds = (obj) => {
    setBounds(obj);
  };

  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };

  const onTextChange = (id, txt, ref) => {
    let indx = result.findIndex((x) => x.id === id);
    let item = { ...result[indx] };
    item.text = txt;
    item.ref = ref;
    result[indx] = item;
    setResult(result);
  };

  const changeButtonType = (type) => {
    setButtonType(type);
  };

  const resetButtonType = () => {
    setButtonType("");
  };

  const insertNewPage = async () => {
    if (pdfFile) {
      try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const newPage = pdfDoc.addPage(PageSizes.A4);
        const newPdfBytes = await pdfDoc.save();
        setPdfFile(new Blob([newPdfBytes], { type: 'application/pdf' }));
        setPageNumber(pdfDoc.getPageCount()); // Set page number to the newly inserted page
      } catch (error) {
        console.error('Error inserting new page:', error);
      }
    }
  };
  

  return (
    <div className="App">
      {!fileUploaded && <FileUploader onFileUpload={handleFileUpload} />}
      {pdfFile ? (
        <>
          {result.map((res) => {
            if (res.type === "text") {
              let isShowing = "hidden";
              if (res.page === pageNumber) {
                isShowing = "visible";
              }
              return (
                <AutoTextArea
                  key={res.id}
                  unique_key={res.id}
                  val={res.text}
                  onTextChange={onTextChange}
                  style={{ visibility: isShowing, color: "red", fontWeight: "normal", fontSize: 16, zIndex: 20, position: "absolute", left: res.x + 'px', top: res.y + 'px' }}
                ></AutoTextArea>
              );
            } else {
              return null;
            }
          })}

          <h1 style={{ color: "#3f51b5" }}>REACT PDF EDITOR</h1>

          <hr />

          <div className="navbar">
            <button onClick={undo} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-fw fa-undo"></i></button>
            <button onClick={redo} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-fw fa-redo"></i></button>
            <button onClick={addText} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-fw fa-text"></i></button>
            <button onClick={() => changeButtonType("draw")} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-fw fa-pencil"></i></button>
            <button onClick={() => changeButtonType("download")} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-fw fa-download"></i></button>
            <button onClick={insertNewPage} style={{ marginTop: "1%", marginBottom: "1%" }}>New Page</button>
          </div>

          <SinglePage resetButtonType={resetButtonType} buttonType={buttonType} cursor={isText ? "text" : "default"} pdf={pdfFile} pageChange={pageChange} getPaths={getPaths} flag={flag} getBounds={getBounds} changeFlag={changeFlag} />
          <ModifyPage resetButtonType={resetButtonType} buttonType={buttonType} pdf={pdfFile} result={result} bounds={bounds} />
          <ImageUploader onImageUpload={handleImageUpload} />
          <hr></hr>
        </>
      ) : (
        <p></p>
        // <p>Please upload a PDF file</p>
      )}
    </div>
  );
}
