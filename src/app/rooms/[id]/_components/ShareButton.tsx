'use client';

import { useState } from 'react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    setError(null);
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy url:', e);
      setError('コピーに失敗しました');
    }
  };

  return (
    <div className="relative inline-flex flex-col">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        <span>URLを共有</span>
        <span className="text-sm">🔗</span>
      </button>

      {(copied || error) && (
        <div className="pointer-events-none absolute top-full mt-1 right-0 left-0 text-center rounded-full bg-gray-800/90 px-2 py-0.5 text-[11px] text-white shadow-lg">
          {copied && !error ? 'コピーしました' : error}
        </div>
      )}
    </div>
  );
}


