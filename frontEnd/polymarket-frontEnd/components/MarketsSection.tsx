export const dynamic = 'force-dynamic';
// Server component: shared Markets grid for Home and /markets
import MarketCard from './markets/MarketCard'

type MarketRow = {
  id: string | null
  question: string
  odds: number | null
  sentimentScore: number | null
  sentimentNormalized?: number | null
  bullishPct?: number | null
  bearishPct?: number | null
  signalStrength: number | null
  signalLabel: 'Strong Mismatch' | 'Moderate Mismatch' | 'Normal' | string
}

async function fetchMarkets(): Promise<{ markets: MarketRow[]; error?: string }> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${API_BASE}/api/markets`, { cache: 'no-store' });
    if (!res.ok) return { error: `backend returned ${res.status}`, markets: [] };
    const payload = await res.json();
    const markets = Array.isArray(payload?.markets) ? payload.markets : [];
    return { markets } as { markets: MarketRow[] };
  } catch (e: any) {
    return { error: e?.message || String(e), markets: [] };
  }
}

export default async function MarketsSection() {
  const { markets, error } = await fetchMarkets();
  return (
    <div className="grid-cards mt-4">
      {error && (
        <div className="card col-span-full" style={{ borderColor: 'rgba(255,0,0,0.2)' }}>
          <div className="text-sm" style={{ color: 'salmon' }}>Error: {error}</div>
        </div>
      )}

      {markets && markets.length > 0 ? (
        markets.map((m: MarketRow, idx: number) => (
          <MarketCard key={m.id || idx} m={m as any} />
        ))
      ) : (
        <div className="card col-span-full">
          <div className="flex items-start gap-3">
            <div className="skeleton h-6 w-6 rounded" style={{ opacity: 0.25 }} />
            <div>
              <div className="text-base md:text-lg font-semibold">No markets found</div>
              <div className="muted mt-1">Try refreshing in a moment, or check your backend connection.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
