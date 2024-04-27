import React, { useRef } from 'react';

const ImageUploader = ({ onImageUpload }) => {
  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const imageDataUrl = reader.result;
        onImageUpload(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button onClick={() => inputRef.current.click()}>Upload Image</button>
    </div>
  );
};

export default ImageUploader;
