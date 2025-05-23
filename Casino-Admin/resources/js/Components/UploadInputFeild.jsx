import React, { useState } from "react";

const UploadInputFeild = () => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="upload-box mb-2 p-4 border border-gray-300 rounded-lg w-full max-w-md">
      <p className="mb-2 text-gray-700">Upload files</p>
      <input
        name="file_upload"
        type="file"
        id="upload"
        className="hidden"
        onChange={handleFileChange}
        required
      />
      <label
        htmlFor="upload"
        className="upload-input cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg inline-block hover:bg-blue-600"
      >
        <span>+ Select File</span>
      </label>
      {fileName && <p className="mt-2 text-sm text-gray-600">Selected: {fileName}</p>}
    </div>
  );
};

export default UploadInputFeild;