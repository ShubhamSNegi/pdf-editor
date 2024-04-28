import { height, width } from '@fortawesome/free-solid-svg-icons/fa0';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function FileUploader({ onFileUpload }) {
    const onDrop = useCallback((acceptedFiles) => {
        onFileUpload(acceptedFiles);
    }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some PDF files here, or click to select files</p>
      }
    </div>
  );
}

const dropzoneStyle = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  width: '50%',
  margin: '0 auto',
};

export default FileUploader;
