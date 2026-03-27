import { useState } from 'react';
import { Layout } from './components/common/Layout.tsx';
import { NavBar } from './components/common/NavBar.tsx';

type Page = 'play' | 'drills' | 'stats';

function App() {
  const [page, setPage] = useState<Page>('play');
  return (
    <Layout>
      <NavBar currentPage={page} onNavigate={setPage} />
      <main className="p-4">
        {page === 'play' && <div>Play page placeholder</div>}
        {page === 'drills' && <div>Drills page placeholder</div>}
        {page === 'stats' && <div>Stats page placeholder</div>}
      </main>
    </Layout>
  );
}

export default App;
