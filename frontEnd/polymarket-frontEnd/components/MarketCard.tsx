"use client";
import SentimentIndicator from './SentimentIndicator';

type Market = {
  marketId: string;
  title: string;
  category: string;
  outcomes: Array<{ name: string; price: number | null }>;
  prices: Record<string, number | null>;
  volume: number;
  liquidity: number;
  status: 'open' | 'closed' | 'resolved';
  expiry: string | null;
  bullishPct: number | null;
  bearishPct: number | null;
  resolvedOutcome: string | null;
};

function getLeadingOutcome(outcomes: Array<{ name: string; price: number | null }>) {
  if (!outcomes || outcomes.length === 0) return 'N/A';
  const sorted = [...outcomes].sort((a, b) => (b.price || 0) - (a.price || 0));
  return sorted[0].name || 'N/A';
}

function formatExpiry(expiry: string | null) {
  if (!expiry) return 'No expiry';
  const d = new Date(expiry);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    open: { bg: '#DCFCE7', text: '#166534' },
    closed: { bg: '#FEF3C7', text: '#92400E' },
    resolved: { bg: '#FEE2E2', text: '#991B1B' },
  };
  const style = styles[status] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span 
      className="px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}

export default function MarketCard({ market }: { market: Market }) {
  const leadingOutcome = getLeadingOutcome(market.outcomes);
  const yesPrice = market.prices?.['Yes'] != null ? (market.prices['Yes'] * 100).toFixed(1) : 'N/A';
  const noPrice = market.prices?.['No'] != null ? (market.prices['No'] * 100).toFixed(1) : 'N/A';
  const expiry = formatExpiry(market.expiry);

  return (
    <div 
      className="rounded-xl border border-gray-200"
      style={{ 
        backgroundColor: '#F8F9FB',
        padding: '18px',
        boxShadow: 'rgba(0,0,0,0.05) 0 2px 6px'
      }}
    >
      {/* Header with Title and Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 
          className="text-lg line-clamp-2 leading-snug"
          style={{ color: '#111827', fontWeight: 600 }}
        >
          {market.title}
        </h3>
        <StatusBadge status={market.status} />
      </div>

      {/* Category */}
      <div className="mb-3" style={{ fontSize: '0.9rem', color: '#4B5563' }}>
        <span className="font-medium">Category:</span> {market.category}
      </div>

      {/* Leading/Final Outcome */}
      {market.status === 'resolved' && market.resolvedOutcome ? (
        <div className="mb-3 font-semibold" style={{ fontSize: '0.9rem', color: '#991B1B' }}>
          Final Outcome: {market.resolvedOutcome}
        </div>
      ) : (
        <div className="mb-3" style={{ fontSize: '0.9rem', color: '#4B5563' }}>
          <span className="font-medium">Leading:</span> {leadingOutcome}
        </div>
      )}

      {/* Yes/No Prices */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '4px' }}>Yes Price</div>
          <div className="font-semibold" style={{ color: '#111827', fontSize: '1rem' }}>{yesPrice}%</div>
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '4px' }}>No Price</div>
          <div className="font-semibold" style={{ color: '#111827', fontSize: '1rem' }}>{noPrice}%</div>
        </div>
      </div>

      {/* Volume and Liquidity */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '4px' }}>Volume</div>
          <div className="font-semibold" style={{ color: '#111827', fontSize: '1rem' }}>
            ${(market.volume || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '4px' }}>Liquidity</div>
          <div className="font-semibold" style={{ color: '#111827', fontSize: '1rem' }}>
            ${(market.liquidity || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Expiry */}
      <div className="mb-3" style={{ fontSize: '0.9rem', color: '#4B5563' }}>
        <span className="font-medium">Expiry:</span> {expiry}
      </div>

      {/* Sentiment Indicator */}
      <div className="pt-3 border-t" style={{ borderColor: '#E5E7EB' }}>
        <SentimentIndicator bullishPct={market.bullishPct} bearishPct={market.bearishPct} />
      </div>
    </div>
  );
}
