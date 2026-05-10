import { useState } from 'react';

export default function Me() {
  const [balance] = useState(0);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Me Tab — Updated ✅</h1>
        
        <div className="bg-white rounded-3xl shadow-sm border p-6">
          <p className="text-gray-500">Breeze Balance</p>
          <p className="text-5xl font-bold">${balance.toFixed(2)}</p>
        </div>

        <p className="mt-12 text-center text-gray-400">Favorites section coming next...</p>
      </div>
    </div>
  );
}
