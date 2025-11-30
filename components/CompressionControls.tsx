import React from 'react';

interface CompressionControlsProps {
  currentSizeMB: number;
  targetSizeMB: number;
  setTargetSizeMB: (size: number) => void;
  onCompress: () => void;
  isProcessing: boolean;
}

const CompressionControls: React.FC<CompressionControlsProps> = ({
  currentSizeMB,
  targetSizeMB,
  setTargetSizeMB,
  onCompress,
  isProcessing,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Impostazioni Compressione</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Grandezza Massima (MB)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.1"
              max={currentSizeMB}
              value={targetSizeMB}
              onChange={(e) => setTargetSizeMB(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <span className="absolute right-3 top-2 text-slate-400 text-sm">MB</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Attuale: <span className="font-semibold">{currentSizeMB.toFixed(2)} MB</span>
          </p>
        </div>

        <button
          onClick={onCompress}
          disabled={isProcessing || targetSizeMB <= 0}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all transform active:scale-95 flex justify-center items-center
            ${isProcessing || targetSizeMB <= 0
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Compressione in corso...
            </>
          ) : (
            'Comprimi PDF'
          )}
        </button>
      </div>
    </div>
  );
};

export default CompressionControls;
