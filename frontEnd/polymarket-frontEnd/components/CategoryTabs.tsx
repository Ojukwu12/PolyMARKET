"use client";
import { useState } from 'react';

const categories = ['All', 'Crypto', 'Politics', 'Tech', 'AI', 'Sports', 'Entertainment', 'Finance', 'Other'];

export default function CategoryTabs({ onSelect }: { onSelect: (category: string) => void }) {
  const [active, setActive] = useState('All');

  function handleClick(cat: string) {
    setActive(cat);
    onSelect(cat);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === cat
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
