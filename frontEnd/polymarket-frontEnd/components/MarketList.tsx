"use client";
import { useEffect, useState } from 'react';
import MarketCard from './MarketCard';
import CategoryTabs from './CategoryTabs';

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

export default function MarketList() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${base}/markets`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.markets)) {
          setMarkets(data.markets);
          setFilteredMarkets(data.markets);
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

  function handleCategorySelect(category: string) {
    if (category === 'All') {
      setFilteredMarkets(markets);
    } else {
      setFilteredMarkets(markets.filter((m) => m.category === category));
    }
  }

  if (loading) return <div className="text-center py-8">Loading markets...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <div>
      <CategoryTabs onSelect={handleCategorySelect} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((m) => <MarketCard key={m.marketId} market={m} />)
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">No markets in this category.</div>
        )}
      </div>
    </div>
  );
}
