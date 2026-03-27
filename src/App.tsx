import { useState } from 'react';

type Page = 'play' | 'drills' | 'stats';

function App() {
  const [page, setPage] = useState<Page>('play');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="flex gap-4 p-4 bg-gray-800">
        <button
          className={`px-4 py-2 rounded ${page === 'play' ? 'bg-green-600' : 'bg-gray-700'}`}
          onClick={() => setPage('play')}
        >
          Play
        </button>
        <button
          className={`px-4 py-2 rounded ${page === 'drills' ? 'bg-green-600' : 'bg-gray-700'}`}
          onClick={() => setPage('drills')}
        >
          Drills
        </button>
        <button
          className={`px-4 py-2 rounded ${page === 'stats' ? 'bg-green-600' : 'bg-gray-700'}`}
          onClick={() => setPage('stats')}
        >
          Stats
        </button>
      </nav>
      <main className="p-4">
        {page === 'play' && <div>Play page placeholder</div>}
        {page === 'drills' && <div>Drills page placeholder</div>}
        {page === 'stats' && <div>Stats page placeholder</div>}
      </main>
    </div>
  );
}

export default App;
