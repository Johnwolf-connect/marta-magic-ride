import { useState } from 'react';

export default function Me() {
  const [balance] = useState(0.00);
  const [favorites, setFavorites] = useState([]);

  const handleAddFavorite = () => {
    const type = prompt('Home, Work, or Place?', 'Home');
    const address = prompt('Enter address or place name (e.g. Inman Park):');
    if (type && address) {
      setFavorites([...favorites, { id: Date.now(), type, address }]);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Delete this favorite?')) {
      setFavorites(favorites.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-xl mx-auto space-y-8">

        {/* Profile */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-5xl">J</div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow text-blue-600">✏️</button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">John Wolf</h1>
                <button className="text-blue-600">✏️</button>
              </div>
              <p className="text-gray-500">Pulse member</p>
            </div>
            <div className="ml-auto text-4xl">🏆</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t text-center">
            <div>
              <div className="text-xs tracking-widest text-gray-500">STREAK</div>
              <div className="text-3xl font-bold">7 days</div>
            </div>
            <div>
              <div className="text-xs tracking-widest text-gray-500">CO₂ SAVED</div>
              <div className="text-3xl font-bold text-green-600">14kg</div>
            </div>
            <div>
              <div className="text-xs tracking-widest text-gray-500">TRIPS</div>
              <div className="text-3xl font-bold">42</div>
            </div>
          </div>
        </div>

        {/* Breeze */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">BREEZE BALANCE</p>
            <p className="text-4xl font-semibold">${balance.toFixed(2)}</p>
          </div>
          <button className="bg-black text-white px-8 py-3 rounded-2xl font-medium">Top up</button>
        </div>

        {/* Favorites */}
        <div>
          <h3 className="font-semibold mb-3">Favorites</h3>
          {favorites.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-3xl p-10 text-center">
              <p className="text-gray-400 mb-4">Favorites you add will appear here</p>
              <button
                onClick={handleAddFavorite}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium"
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
                  <button
                    onClick={() => handleDelete(fav.id)}
                    className="text-orange-500 text-2xl opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-12">Recent trips will appear here</p>
      </div>
    </div>
  );
}
