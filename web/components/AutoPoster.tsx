'use client';

import { useState } from 'react';
import { api } from '@/lib/config';

export function AutoPoster() {
  const [postLang, setPostLang] = useState('default');
  const [interval, setInterval] = useState(60);
  const [isPosting, setIsPosting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleStartPosting = async () => {
    if (!confirm('자동 게시를 시작하시겠습니까?\n게시 중에는 이 창을 닫지 마세요.')) return;

    setIsPosting(true);
    setLogs(['🚀 자동 게시 시작...']);

    try {
      const response = await fetch(api.post, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postLang, interval }),
      });

      if (!response.body) throw new Error('응답 없음');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        setLogs((prev) => [...prev, text].slice(-20)); // 최근 20개만 유지
      }
    } catch (err) {
      setLogs((prev) => [...prev, `❌ 오류: ${err}`]);
    } finally {
      setIsPosting(false);
      setLogs((prev) => [...prev, '⏹️ 자동 게시 종료']);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">자동 게시</h2>
        <p className="text-gray-600 mb-2">
          구글 스프레드시트의 콘텐츠를 Threads에 자동으로 게시합니다.
        </p>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ 자동 게시 중에는 창을 닫지 마세요!
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          게시 언어 선택
        </label>
        <div className="space-y-3">
          {[
            { value: 'default', label: '🇰🇷 기본', desc: '쓰레드 시트' },
            { value: 'english', label: '🇺🇸 영어', desc: 'English 시트' },
            { value: 'spanish', label: '🇪🇸 스페인어', desc: 'Español 시트' },
            { value: 'both', label: '🌍 둘 다', desc: '영어 + 스페인어 교차' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                postLang === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              } ${isPosting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                value={option.value}
                checked={postLang === option.value}
                onChange={(e) => setPostLang(e.target.value)}
                disabled={isPosting}
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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          게시 간격 (분)
        </label>
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
          disabled={isPosting}
          min={1}
          max={1440}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
        />
        <p className="mt-1 text-sm text-gray-500">최소 1분, 최대 24시간(1440분)</p>
      </div>

      <button
        onClick={handleStartPosting}
        disabled={isPosting}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isPosting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            게시 중... (중단하려면 창을 새로고침하세요)
          </span>
        ) : '🚀 자동 게시 시작'}
      </button>

      {logs.length > 1 && (
        <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-1 leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
