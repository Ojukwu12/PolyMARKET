import MarketsSection from "../../components/MarketsSection";

export const dynamic = 'force-dynamic';

export default async function MarketsPage() {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold">Markets</h2>
      <MarketsSection />
    </div>
  );
}
