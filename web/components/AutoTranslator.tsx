'use client';

import { useState } from 'react';
import { api } from '@/lib/config';

export function AutoTranslator() {
  const [model, setModel] = useState('gemini-2.5-flash');
  const [targetLang, setTargetLang] = useState('english');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!confirm('번역을 시작하시겠습니까?')) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(api.translate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, targetLang }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '번역 실패');
      }

      setResult(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">자동 번역</h2>
        <p className="text-gray-600">
          '쓰레드' 시트의 모든 콘텐츠를 번역하여 각 언어별 시트에 저장합니다.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          번역 AI 모델
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100"
        >
          <option value="gemini-2.5-flash">🤖 Gemini 2.5 Flash</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          번역 대상 언어
        </label>
        <div className="space-y-3">
          {[
            { value: 'english', label: '🇺🇸 영어', desc: 'English' },
            { value: 'spanish', label: '🇪🇸 스페인어', desc: 'Español' },
            { value: 'both', label: '🌍 둘 다', desc: '영어 + 스페인어' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                targetLang === option.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                value={option.value}
                checked={targetLang === option.value}
                onChange={(e) => setTargetLang(e.target.value)}
                disabled={loading}
                className="mr-3 w-5 h-5"
              />
              <div>
                <span className="font-semibold text-gray-800">{option.label}</span>
                <p className="text-sm text-gray-600">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            번역 중...
          </span>
        ) : '🌐 번역 시작'}
      </button>

      {result && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
          <p className="text-green-800 font-semibold flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {result}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-5">
          <p className="text-red-800 font-semibold flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
