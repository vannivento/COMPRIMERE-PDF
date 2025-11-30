import React from 'react';
import { CompressionResult } from '../types';

interface ResultCardProps {
  result: CompressionResult;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const sizeMB = (result.size / (1024 * 1024)).toFixed(2);
  const reduction = Math.round((1 - result.compressionRatio) * 100);

  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900">Compressione Completata!</h3>
            <p className="text-sm text-emerald-700">Il file è stato ridotto del {reduction}%</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-emerald-700">{sizeMB} MB</span>
      </div>

      <div className="flex space-x-3">
        <a
          href={result.url}
          download="compressed_document.pdf"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          Scarica PDF
        </a>
        <button
          onClick={onReset}
          className="px-4 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium transition-colors"
        >
          Nuovo File
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
