import MarketList from "../components/MarketList";

export default function Home() {
  return (
    <div className="space-y-6 p-4">
      <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex gap-5 items-center border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Polymarket Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Aggregated markets with sentiment, categories, and resolution tracking.
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <a className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" href="#markets">
              Explore Markets
            </a>
            <a className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" href="/stats">
              View Stats
            </a>
          </div>
        </div>
      </section>

      <section id="markets">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Markets</h2>
        <MarketList />
      </section>
    </div>
  );
}
