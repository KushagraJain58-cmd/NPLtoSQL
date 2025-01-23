import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  Backend_URL: string;
}

export function FileUpload({ onFileSelect, Backend_URL }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      onFileSelect(droppedFile);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      await axios.post(
        `${Backend_URL}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("File Uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mb-5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Upload CSV</h2>
      <div className="mb-6">
        <h3 className="text-gray-600 dark:text-gray-400">
          Drag and Drop your file here or click on Choose File.
        </h3>
      </div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className="inline-block px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
      >
        Choose File
      </label>
      {file && (
        <div className="mt-4 text-gray-700 dark:text-gray-300">
          <strong>Selected File:</strong> {file.name}
        </div>
      )}
      {/* {file && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 ml-4 px-6 py-3 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      )} */}
    </div>
  );
}