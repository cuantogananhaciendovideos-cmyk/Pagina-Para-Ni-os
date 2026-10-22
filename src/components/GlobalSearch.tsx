import React, { useMemo, useState } from 'react';
import { Search, Users, BookOpen, X, ShieldCheck, UsersRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

type SearchItem = { id: string; title: string; subtitle: string; kind: 'friend' | 'page' | 'group'; };
const safeRead = (key: string): any[] => {
  const defaults: Record<string, any[]> = {
    cluky_little_pages: [
      { id: 'page-reading', name: 'Pequeños Lectores', description: 'Cuentos y lectura', category: 'Lectura' },
      { id: 'page-art', name: 'Club de Arte Creativo', description: 'Dibujos y manualidades', category: 'Arte' },
    ],
    cluky_little_groups: [
      { id: 'group-games', name: 'Club de Juegos Seguros', description: 'Juegos apropiados para cada edad', category: 'Videojuegos' },
      { id: 'group-books', name: 'Lectores en Familia', description: 'Leer y aprender juntos', category: 'Lectura' },
    ],
  };
  try { const value = localStorage.getItem(key); if (!value) return defaults[key] || []; const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : (defaults[key] || []); }
  catch { return defaults[key] || []; }
};

/** Search for approved friends and Little Pages/Groups. Children are never listed in a public directory. */
export const GlobalSearch: React.FC<{ placement?: 'header' | 'profile' }> = ({ placement = 'header' }) => {
  const { friends, role, setActiveTab } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const q = query.trim().toLocaleLowerCase();
  const results = useMemo<SearchItem[]>(() => {
    if (!q) return [];
    const approvedFriends: SearchItem[] = (friends || [])
      .filter(friend => friend && friend.status === 'approved' && !friend.isImaginary && (friend.firstName || '').toLocaleLowerCase().includes(q))
      .map(friend => ({ id: friend.id, title: friend.firstName, subtitle: 'Amigo aprobado por un adulto', kind: 'friend' }));
    const pages: SearchItem[] = safeRead('cluky_little_pages')
      .filter(item => item && `${item.name || item.title || ''} ${item.description || ''} ${item.category || ''}`.toLocaleLowerCase().includes(q))
      .map(item => ({ id: item.id || item.name, title: item.name || item.title || 'Little Page', subtitle: `Little Page · ${item.category || 'Comunidad'}`, kind: 'page' }));
    const groups: SearchItem[] = safeRead('cluky_little_groups')
      .filter(item => item && `${item.name || item.title || ''} ${item.description || ''} ${item.category || ''}`.toLocaleLowerCase().includes(q))
      .map(item => ({ id: item.id || item.name, title: item.name || item.title || 'Little Group', subtitle: `Little Group · ${item.category || 'Comunidad'}`, kind: 'group' }));
    return [...approvedFriends, ...pages, ...groups].slice(0, 8);
  }, [friends, q]);

  // Do not expose child search to adult dashboard; child lookup is limited to approved friends.
  if (role === 'parent') return null;
  const selectResult = (item: SearchItem) => {
    setOpen(false);
    if (item.kind === 'friend') {
      setActiveTab('friends');
      return;
    }
    const section = item.kind === 'page' ? 'pages' : 'groups';
    try { localStorage.setItem('cluky_little_world_open_section', section); } catch { /* storage may be unavailable */ }
    window.dispatchEvent(new CustomEvent('cluky-search-select', { detail: { section } }));
    setActiveTab('little-world');
  };

  return (
    <div className={`relative ${placement === 'header' ? 'w-full max-w-sm' : 'w-full'}`}>
      <div className={`flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 ${placement === 'header' ? 'py-2' : 'py-3 shadow-sm'}`}>
        <Search className="w-4 h-4 shrink-0 text-indigo-500" />
        <input
          value={query}
          onChange={event => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}
          placeholder="Buscar amigos, páginas o grupos…"
          aria-label="Buscar amigos, páginas o grupos"
          className="w-full min-w-0 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
        />
        {query && <button type="button" onClick={() => { setQuery(''); setOpen(false); }} aria-label="Limpiar búsqueda" className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-4 h-4" /></button>}
      </div>
      {open && q && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
          <div className="px-3 py-2 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300"><ShieldCheck className="w-3.5 h-3.5" /> Búsqueda protegida · amigos aprobados</div>
          {results.length ? results.map(item => {
            const Icon = item.kind === 'friend' ? Users : item.kind === 'page' ? BookOpen : UsersRound;
            return <button key={`${item.kind}-${item.id}`} type="button" onClick={() => selectResult(item)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
              <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300"><Icon className="w-4 h-4" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{item.title}</span><span className="block truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</span></span>
            </button>;
          }) : <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">No encontramos resultados. Los niños solo pueden buscar amigos previamente aprobados.</div>}
        </div>
      )}
    </div>
  );
};
