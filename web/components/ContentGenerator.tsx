'use client';

import { useState } from 'react';
import { api } from '@/lib/config';

export function ContentGenerator() {
  const [model, setModel] = useState('gemini-2.5-flash');
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(api.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, count }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '생성 실패');
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI 콘텐츠 생성</h2>
        <p className="text-gray-600">
          AI를 이용해 콘텐츠를 생성하고 구글 스프레드시트에 자동 저장합니다.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          AI 모델 선택
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="gemini-2.5-flash">🤖 Gemini 2.5 Flash</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          프롬프트
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          placeholder="예시: SNS 마케팅 전문가로서 Z세대를 위한 제품 홍보 게시글을 작성해줘..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={8}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          생성할 게시글 수
        </label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          disabled={loading}
          min={1}
          max={100}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-sm text-gray-500">최소 1개, 최대 100개</p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            생성 중...
          </span>
        ) : '🚀 생성 및 시트에 저장'}
      </button>

      {result && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 animate-fade-in">
          <p className="text-green-800 font-semibold flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {result}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-5 animate-fade-in">
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
