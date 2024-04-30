import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SinglePage from './Components/SinglePage';
import ModifyPage from './Components/ModifyPage';
import AutoTextArea from './Components/AutoTextArea';
import FileUploader from './Components/FileUploader';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { PDFDocument, PageSizes } from 'pdf-lib';

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
  const [uploadedImage, setUploadedImage] = useState(null);
  const [lastClickLocation, setLastClickLocation] = useState({ x: 0, y: 0 });

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

  const addImage = () => {
    setIsText(false); // Ensure text mode is turned off
    document.getElementById("drawArea").addEventListener("click", handleImageClick);
  };
  
  // Event listener to handle image click and capture mouse coordinates
  const handleImageClick = (e) => {
    const mouseX = e.clientX + document.documentElement.scrollLeft || document.body.scrollLeft;
    const mouseY = e.clientY + document.documentElement.scrollTop || document.body.scrollTop;
    handleImageUpload(mouseX, mouseY);
  };
  
  // Function to handle image upload with provided mouse coordinates
  const handleImageUpload = (mouseX, mouseY) => {
    document.getElementById("imageInput").click();
    const fileInput = document.getElementById("imageInput");
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setResult([
            ...result,
            { id: generateKey(mouseX), x: mouseX, y: mouseY - 10, image: event.target.result, page: pageNumber, type: "image" }, // Include page number
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
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

  const insertNewImage = async () => {
  };
  

  return (
    <div className="App">
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
            <button onClick={redo} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-repeat"></i></button>
            <button onClick={addText} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-text-width"></i></button>
            {/* <button onClick={() => changeButtonType("draw")} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-fw fa-pencil"></i></button> */}
            <button onClick={() => changeButtonType("download")} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-fw fa-download"></i></button>
            <button onClick={insertNewPage} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-plus"></i></button>
            <button onClick={addImage} style={{ marginTop: "1%", marginBottom: "1%" }}><i style={{ fontSize: 25 }} className="fa fa-picture-o"></i></button>
          </div>
          <input id="imageInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          <SinglePage resetButtonType={resetButtonType} buttonType={buttonType} cursor={isText ? "text" : "default"} pdf={pdfFile} pageChange={pageChange} getPaths={getPaths} flag={flag} getBounds={getBounds} changeFlag={changeFlag} images={result} />
          <ModifyPage resetButtonType={resetButtonType} buttonType={buttonType} pdf={pdfFile} result={result} bounds={bounds} />
          <hr></hr>
        </>
      ) : (
        <>
        <h1 style={{ color: "#3f51b5", marginBottom: '10%'}}>REACT PDF EDITOR</h1>
        {!fileUploaded && <FileUploader onFileUpload={handleFileUpload} />}
        </>
      )}
    </div>
  );
}
