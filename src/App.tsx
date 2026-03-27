import { useState } from 'react';
import { Layout } from './components/common/Layout.tsx';
import { NavBar } from './components/common/NavBar.tsx';
import { PlayPage } from './pages/PlayPage.tsx';

type Page = 'play' | 'drills' | 'stats';

function App() {
  const [page, setPage] = useState<Page>('play');
  return (
    <Layout>
      <NavBar currentPage={page} onNavigate={setPage} />
      <main className="p-4">
        {page === 'play' && <PlayPage />}
        {page === 'drills' && <div className="text-center py-12 text-gray-400">Drills coming soon</div>}
        {page === 'stats' && <div className="text-center py-12 text-gray-400">Stats coming soon</div>}
      </main>
    </Layout>
  );
}

export default App;
