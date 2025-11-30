import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import CompressionControls from './components/CompressionControls';
import ResultCard from './components/ResultCard';
import SmartAnalysis from './components/SmartAnalysis';
import { PDFFile, CompressionStatus, CompressionResult, GeminiStatus } from './types';
import { compressPDF, extractTextFromPDF } from './services/pdfCompressionService';
import { analyzePDFContent } from './services/geminiService';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PDFFile | null>(null);
  const [targetSizeMB, setTargetSizeMB] = useState<number>(0);
  const [status, setStatus] = useState<CompressionStatus>(CompressionStatus.IDLE);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  
  // Gemini State
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);
  const [analysisText, setAnalysisText] = useState<string>("");

  useEffect(() => {
    // Cleanup URL objects to avoid memory leaks
    return () => {
      if (selectedFile) URL.revokeObjectURL(selectedFile.url);
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [selectedFile, result]);

  const handleFileSelect = (fileData: PDFFile) => {
    setSelectedFile(fileData);
    setTargetSizeMB(parseFloat(((fileData.size / (1024 * 1024)) * 0.7).toFixed(2))); // Default to 70% of original
    setStatus(CompressionStatus.IDLE);
    setResult(null);
    setGeminiStatus(GeminiStatus.IDLE);
    setAnalysisText("");
    
    // Start Gemini analysis automatically on file load
    handleAnalyzeContent(fileData.file);
  };

  const handleAnalyzeContent = async (file: File) => {
    if (!process.env.API_KEY) return; // Skip if no API key
    
    try {
      setGeminiStatus(GeminiStatus.ANALYZING);
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        setAnalysisText("Nessun testo estraibile trovato per l'analisi.");
        setGeminiStatus(GeminiStatus.COMPLETED);
        return;
      }
      const summary = await analyzePDFContent(text);
      setAnalysisText(summary);
      setGeminiStatus(GeminiStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setGeminiStatus(GeminiStatus.ERROR);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setStatus(CompressionStatus.PROCESSING);
    setProgress(0);

    try {
      const { blob, size } = await compressPDF({
        file: selectedFile.file,
        targetSizeMB,
        onProgress: setProgress,
      });

      const compressionRatio = size / selectedFile.size;
      const url = URL.createObjectURL(blob);

      setResult({
        blob,
        size,
        url,
        compressionRatio,
      });
      setStatus(CompressionStatus.COMPLETED);
    } catch (error) {
      console.error("Compression failed:", error);
      setStatus(CompressionStatus.ERROR);
      alert("Si è verificato un errore durante la compressione.");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setStatus(CompressionStatus.IDLE);
    setGeminiStatus(GeminiStatus.IDLE);
    setAnalysisText("");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Smart PDF Compressor
          </h1>
          <p className="text-lg text-slate-600">
            Riduci la dimensione dei tuoi PDF in modo intelligente.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {!selectedFile ? (
            <FileUpload onFileSelect={handleFileSelect} />
          ) : (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">PDF</span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800 truncate max-w-xs">{selectedFile.name}</h2>
                    <p className="text-sm text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                {status !== CompressionStatus.PROCESSING && !result && (
                  <button onClick={handleReset} className="text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {status === CompressionStatus.PROCESSING && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                    <span>Elaborazione pagine...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {!result && (
                <CompressionControls
                  currentSizeMB={selectedFile.size / (1024 * 1024)}
                  targetSizeMB={targetSizeMB}
                  setTargetSizeMB={setTargetSizeMB}
                  onCompress={handleCompress}
                  isProcessing={status === CompressionStatus.PROCESSING}
                />
              )}

              {result && (
                <ResultCard result={result} onReset={handleReset} />
              )}
              
              <SmartAnalysis status={geminiStatus} analysis={analysisText} />
            </div>
          )}
        </div>
        
        <p className="text-center text-slate-400 text-sm mt-8">
          Tutta l'elaborazione avviene nel tuo browser. Nessun file viene inviato a server esterni per la compressione.
          <br/>
          (Solo l'analisi del testo viene inviata a Gemini)
        </p>
      </div>
    </div>
  );
};

export default App;
