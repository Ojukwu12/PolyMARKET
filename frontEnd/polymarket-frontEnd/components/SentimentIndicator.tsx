// SentimentIndicator component
// Display sentiment as a color indicator (green=bullish, red=bearish, grey=no sentiment)
export default function SentimentIndicator({ bullishPct, bearishPct }: { bullishPct: number | null, bearishPct: number | null }) {
  if (bullishPct == null || bearishPct == null) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9CA3AF' }} />
        <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>No sentiment</span>
      </div>
    );
  }

  const isBullish = bullishPct > bearishPct;
  const color = isBullish ? '#16A34A' : '#DC2626';
  const bgColor = isBullish ? '#DCFCE7' : '#FEE2E2';
  const label = isBullish ? 'Bullish' : 'Bearish';
  const pct = isBullish ? bullishPct : bearishPct;

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-medium" style={{ fontSize: '0.9rem', color: '#111827' }}>
        {label} {pct}%
      </span>
    </div>
  );
}
