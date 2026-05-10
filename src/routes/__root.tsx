import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

function MeComponent() {
  const [balance] = useState(0.00);
  const [favorites, setFavorites] = useState([]);

  const handleAddFavorite = () => {
    const type = prompt('Home, Work, or Place?', 'Home');
    if (!type) return;
    const address = prompt(`Enter address for ${type}:`, 'Inman Park');
    if (address) {
      setFavorites([...favorites, { id: Date.now(), type, address }]);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this favorite?')) {
      setFavorites(favorites.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Me Tab — Updated ✅</h1>

        {/* Profile */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-5xl font-semibold text-blue-600">J</div>
              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow text-blue-600 border">✏️</button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">John Wolf</h2>
                <button className="text-blue-600 text-xl">✏️</button>
              </div>
              <p className="text-sm text-gray-500">Pulse member</p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>

        {/* Breeze Balance */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">BREEZE BALANCE</p>
            <p className="text-4xl font-semibold">${balance.toFixed(2)}</p>
          </div>
          <button className="bg-black text-white px-8 py-3 rounded-2xl font-medium">Top up</button>
        </div>

        {/* Favorites */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Favorites</h3>
          {favorites.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center">
              <p className="text-gray-400">Favorites you add will appear here</p>
              <button
                onClick={handleAddFavorite}
                className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-2xl font-medium"
              >
                + Add Fav
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map(fav => (
                <div key={fav.id} className="bg-white border rounded-2xl p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <p className="font-medium">{fav.type}</p>
                      <p className="text-sm text-gray-500">{fav.address}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(fav.id)} className="text-orange-500 text-2xl">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// This line is required for TanStack Router
export const Route = createFileRoute('/me')({
  component: MeComponent,
});
