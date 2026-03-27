import { useState } from 'react';
import { Layout } from './components/common/Layout.tsx';
import { NavBar } from './components/common/NavBar.tsx';
import { PlayPage } from './pages/PlayPage.tsx';
import { DrillsPage } from './pages/DrillsPage.tsx';
import { StatsPage } from './pages/StatsPage.tsx';

type Page = 'play' | 'drills' | 'stats';

function App() {
  const [page, setPage] = useState<Page>('play');

  return (
    <Layout>
      <NavBar currentPage={page} onNavigate={setPage} />
      <main className="p-4">
        {page === 'play' && <PlayPage />}
        {page === 'drills' && <DrillsPage />}
        {page === 'stats' && <StatsPage />}
      </main>
    </Layout>
  );
}

export default App;
