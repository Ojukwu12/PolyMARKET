export default function MarketsLoading() {
  const items = Array.from({ length: 6 });
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold">Markets</h2>
      <div className="grid-cards mt-4">
        {items.map((_, idx) => (
          <div key={idx} className="card">
            <div className="skeleton h-5 w-3/4 mb-3" />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-3 items-center">
              <div>
                <div className="skeleton h-3 w-14 mb-2" />
                <div className="skeleton h-5 w-12" />
              </div>
              <div>
                <div className="skeleton h-3 w-16 mb-2" />
                <div className="skeleton h-5 w-16" />
              </div>
              <div>
                <div className="skeleton h-3 w-16 mb-2" />
                <div className="skeleton h-5 w-16" />
              </div>
              <div>
                <div className="skeleton h-3 w-16 mb-2" />
                <div className="skeleton h-5 w-16" />
              </div>
              <div>
                <div className="skeleton h-3 w-24 mb-2" />
                <div className="skeleton h-5 w-20" />
              </div>
              <div className="md:text-right mt-2 md:mt-0">
                <div className="skeleton h-6 w-24 rounded-full inline-block" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
