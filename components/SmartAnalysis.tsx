import React from 'react';
import { GeminiStatus } from '../types';

interface SmartAnalysisProps {
  status: GeminiStatus;
  analysis: string;
}

const SmartAnalysis: React.FC<SmartAnalysisProps> = ({ status, analysis }) => {
  if (status === GeminiStatus.IDLE) return null;

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <div className="flex items-center space-x-2 mb-3">
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="font-semibold text-slate-800">Analisi Intelligente (Gemini)</h3>
      </div>

      <div className="bg-purple-50 rounded-xl p-5 text-sm text-slate-700 leading-relaxed border border-purple-100">
        {status === GeminiStatus.ANALYZING ? (
          <div className="flex items-center space-x-3">
            <div className="animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-200"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-400"></div>
            </div>
            <span>Analisi del contenuto del documento in corso...</span>
          </div>
        ) : status === GeminiStatus.ERROR ? (
          <span className="text-red-500">Impossibile analizzare il documento. Verifica la chiave API.</span>
        ) : (
          <div className="prose prose-purple max-w-none">
             <p className="whitespace-pre-line">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAnalysis;
