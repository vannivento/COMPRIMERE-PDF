import React, { useCallback } from 'react';
import { PDFFile } from '../types';

interface FileUploadProps {
  onFileSelect: (file: PDFFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          onFileSelect({
            file,
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file),
          });
        } else {
          alert("Per favore carica solo file PDF.");
        }
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
        if (file.type === 'application/pdf') {
          onFileSelect({
            file,
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file),
          });
        }
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group"
    >
      <input
        type="file"
        id="fileInput"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
          <svg className="w-8 h-8 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">Carica il tuo PDF</h3>
        <p className="text-sm text-slate-500">Trascina qui il file o clicca per selezionare</p>
      </label>
    </div>
  );
};

export default FileUpload;
