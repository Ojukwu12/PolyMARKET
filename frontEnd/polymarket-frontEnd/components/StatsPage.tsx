"use client";
import { useEffect, useState } from 'react';

type StatRecord = {
  marketId: string;
  title: string;
  finalOutcome: string | null;
  sentimentAtTheTime: { bullishPct: number | null; bearishPct: number | null } | null;
  category: string;
  resolvedAt: string;
};

type WinRate = {
  bullishWins: number;
  bearishWins: number;
  total: number;
  bullishWinRate: number;
  bearishWinRate: number;
  totalWinRate: number;
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatRecord[]>([]);
  const [winrate, setWinrate] = useState<WinRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${base}/api/stats`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.ok && data.data) {
          setStats(data.data.stats || []);
          setWinrate(data.data.winrate || null);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-8">Loading stats...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stats</h1>

      {winrate && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Win Rates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Bullish Win Rate</div>
              <div className="text-2xl font-bold text-green-600">{winrate.bullishWinRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">({winrate.bullishWins} wins)</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Bearish Win Rate</div>
              <div className="text-2xl font-bold text-red-600">{winrate.bearishWinRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">({winrate.bearishWins} wins)</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Total Win Rate</div>
              <div className="text-2xl font-bold text-blue-600">{winrate.totalWinRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">({winrate.total} total)</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Resolved Markets</h2>
        {stats.length > 0 ? (
          <div className="space-y-3">
            {stats.map((s) => (
              <div
                key={s.marketId}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 space-y-2"
              >
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{s.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Final Outcome:</span> {s.finalOutcome || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Category:</span> {s.category}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Resolved:</span> {new Date(s.resolvedAt).toLocaleDateString()}
                </div>
                {s.sentimentAtTheTime && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Sentiment:</span> Bullish {s.sentimentAtTheTime.bullishPct}% / Bearish{' '}
                    {s.sentimentAtTheTime.bearishPct}%
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">No resolved markets yet.</div>
        )}
      </div>
    </div>
  );
}
