'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';

interface ConfigStatus {
  google: boolean;
  threads: boolean;
  gcp: boolean;
}

export function Settings() {
  const [status, setStatus] = useState<ConfigStatus>({
    google: false,
    threads: false,
    gcp: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(api.status);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const allConfigured = Object.values(status).every((v) => v);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">환경 설정 상태</h2>
        <p className="text-gray-600">
          현재 설정된 API 키 및 인증 정보를 확인합니다.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">확인 중...</p>
        </div>
      ) : (
        <>
          {allConfigured && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 text-center">
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="font-bold text-green-900 text-lg">모든 설정 완료!</h3>
              <p className="text-green-700 text-sm mt-1">이제 모든 기능을 사용할 수 있습니다.</p>
            </div>
          )}

          <div className="space-y-3">
            <StatusCard
              title="Google API Key"
              description="Gemini 모델 사용"
              status={status.google}
              icon="🤖"
            />
            <StatusCard
              title="Threads Access Token"
              description="Threads 게시 권한"
              status={status.threads}
              icon="🧵"
            />
            <StatusCard
              title="GCP Service Account"
              description="Google Sheets 연동"
              status={status.gcp}
              icon="📊"
            />
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              설정 방법
            </h3>
            <div className="text-blue-800 text-sm space-y-2">
              <p>프로젝트 루트의 <code className="bg-blue-100 px-2 py-1 rounded font-mono">.env</code> 파일에 필요한 API 키를 설정하세요.</p>
              <div className="bg-blue-100 rounded p-3 mt-3 font-mono text-xs">
                <div>GOOGLE_API_KEY=AIza...</div>
                <div>LONG_LIVED_ACCESS_TOKEN=...</div>
                <div>GCP_PROJECT_ID=...</div>
                <div>GCP_PRIVATE_KEY="..."</div>
                <div>GCP_CLIENT_EMAIL=...</div>
              </div>
            </div>
          </div>

          <button
            onClick={checkStatus}
            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
          >
            🔄 다시 확인
          </button>
        </>
      )}
    </div>
  );
}

function StatusCard({
  title,
  description,
  status,
  icon,
}: {
  title: string;
  description: string;
  status: boolean;
  icon: string;
}) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
      status
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
    }`}>
      <div className="flex items-center">
        <span className="text-3xl mr-4">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div>
        {status ? (
          <span className="flex items-center text-green-600 font-semibold px-4 py-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            OK
          </span>
        ) : (
          <span className="flex items-center text-red-600 font-semibold px-4 py-2 bg-red-100 rounded-lg">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            없음
          </span>
        )}
      </div>
    </div>
  );
}
