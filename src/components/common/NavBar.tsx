type Page = 'play' | 'drills' | 'stats';

interface NavBarProps { currentPage: Page; onNavigate: (page: Page) => void; }

const PAGES: { id: Page; label: string }[] = [
  { id: 'play', label: 'Play' },
  { id: 'drills', label: 'Drills' },
  { id: 'stats', label: 'Stats' },
];

export function NavBar({ currentPage, onNavigate }: NavBarProps) {
  return (
    <>
      <nav className="hidden md:flex gap-2 p-3 bg-gray-800 border-b border-gray-700">
        <span className="font-bold text-green-400 mr-4 self-center">Floating Bridge Trainer</span>
        {PAGES.map(({ id, label }) => (
          <button key={id} className={`px-4 py-2 rounded font-medium transition-colors ${currentPage === id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} onClick={() => onNavigate(id)}>{label}</button>
        ))}
      </nav>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex bg-gray-800 border-t border-gray-700 z-50">
        {PAGES.map(({ id, label }) => (
          <button key={id} className={`flex-1 py-4 text-center font-medium transition-colors ${currentPage === id ? 'text-green-400' : 'text-gray-400'}`} onClick={() => onNavigate(id)}>{label}</button>
        ))}
      </nav>
    </>
  );
}
