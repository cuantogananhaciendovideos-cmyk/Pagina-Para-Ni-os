import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Store, Plus, Search, Heart, ShieldCheck, Gamepad2, Package, Tag, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Section = 'pages' | 'groups' | 'market';
type Listing = { id: string; title: string; description: string; price: string; category: string; condition: string; seller: string; image: string; createdAt: number; };
type Community = { id: string; name: string; description: string; category: string; privacy?: string; createdAt: number; };
const MARKET_CATEGORIES = ['Todos', 'Juguetes', 'Juegos físicos', 'Videojuegos', 'Juegos digitales', 'Mercancía y coleccionables', 'Libros y aprendizaje', 'Ropa y accesorios', 'Arte y manualidades', 'Deportes y aire libre', 'Bebés y familia', 'Otros'];
const seedPages: Community[] = [
  { id: 'page-reading', name: 'Pequeños Lectores', description: 'Un espacio para compartir cuentos, libros y aventuras de lectura.', category: 'Lectura', createdAt: 1 },
  { id: 'page-art', name: 'Club de Arte Creativo', description: 'Dibujos, manualidades y proyectos hechos con imaginación.', category: 'Arte', createdAt: 2 },
];
const seedGroups: Community[] = [
  { id: 'group-games', name: 'Club de Juegos Seguros', description: 'Recomendaciones de juegos apropiados para cada edad.', category: 'Videojuegos', privacy: 'Aprobación de adulto', createdAt: 1 },
  { id: 'group-books', name: 'Lectores en Familia', description: 'Familias que leen y aprenden juntas.', category: 'Lectura', privacy: 'Privado', createdAt: 2 },
];
const readStored = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } };

export const LittleWorldView: React.FC = () => {
  const { role, currentUser, openAuthModal } = useApp();
  const [section, setSection] = useState<Section>(() => { try { const saved = localStorage.getItem('cluky_little_world_open_section'); return saved === 'groups' || saved === 'market' || saved === 'pages' ? saved : 'pages'; } catch { return 'pages'; } });
  const [pages, setPages] = useState<Community[]>(() => readStored('cluky_little_pages', seedPages));
  const [groups, setGroups] = useState<Community[]>(() => readStored('cluky_little_groups', seedGroups));
  const [listings, setListings] = useState<Listing[]>(() => readStored('cluky_little_market', []));
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [communityCategory, setCommunityCategory] = useState('General');
  const [privacy, setPrivacy] = useState('Aprobación de adulto');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [listingCategory, setListingCategory] = useState('Juguetes');
  const [condition, setCondition] = useState('Nuevo');
  const [image, setImage] = useState('');
  const [seller, setSeller] = useState('Adulto responsable');

  useEffect(() => {
    const handleSearchSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ section?: Section }>).detail;
      if (detail?.section === 'pages' || detail?.section === 'groups' || detail?.section === 'market') setSection(detail.section);
    };
    window.addEventListener('cluky-search-select', handleSearchSelect);
    return () => window.removeEventListener('cluky-search-select', handleSearchSelect);
  }, []);

  useEffect(() => { try { localStorage.setItem('cluky_little_pages', JSON.stringify(pages)); } catch { setNotice('El navegador no pudo guardar los cambios localmente. Libera espacio o vuelve a intentarlo.'); } }, [pages]);
  useEffect(() => { try { localStorage.setItem('cluky_little_groups', JSON.stringify(groups)); } catch { setNotice('El navegador no pudo guardar los cambios localmente. Libera espacio o vuelve a intentarlo.'); } }, [groups]);
  useEffect(() => { try { localStorage.setItem('cluky_little_market', JSON.stringify(listings)); } catch { setNotice('El navegador no pudo guardar el anuncio localmente. Reduce el tamaño de la imagen o libera espacio.'); } }, [listings]);

  const filteredListings = useMemo(() => listings.filter(item => (category === 'Todos' || item.category === category) && `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase())), [listings, category, search]);
  const resetForm = () => { setShowCreate(false); setName(''); setDescription(''); setTitle(''); setPrice(''); setImage(''); };
  const requireAdult = () => {
    if (!currentUser) { openAuthModal(); setNotice('Inicia sesión para continuar. Las publicaciones comerciales deben ser creadas o aprobadas por un adulto responsable.'); return false; }
    if (role === 'child') { setNotice('Por seguridad, esta acción requiere que mamá, papá o un adulto responsable la realice o autorice.'); return false; }
    return true;
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAdult()) return;
    if (section === 'pages' || section === 'groups') {
      if (!name.trim() || !description.trim()) { setNotice('Completa el nombre y la descripción.'); return; }
      const item: Community = { id: `${section}-${Date.now()}`, name: name.trim(), description: description.trim(), category: communityCategory, privacy: section === 'groups' ? privacy : undefined, createdAt: Date.now() };
      if (section === 'pages') setPages(prev => [item, ...prev]); else setGroups(prev => [item, ...prev]);
      setNotice(section === 'pages' ? 'Página creada en este navegador.' : 'Grupo creado en este navegador.');
    } else {
      if (!title.trim() || !description.trim() || !price.trim()) { setNotice('Completa título, descripción y precio.'); return; }
      const amount = Number(price);
      if (!Number.isFinite(amount) || amount < 0) { setNotice('Escribe un precio válido.'); return; }
      const item: Listing = { id: `listing-${Date.now()}`, title: title.trim(), description: description.trim(), price: amount.toFixed(2), category: listingCategory, condition, seller: seller.trim() || 'Adulto responsable', image, createdAt: Date.now() };
      setListings(prev => [item, ...prev]); setNotice('Anuncio guardado en este navegador. Todavía no es visible para otros usuarios.');
    }
    resetForm();
  };
  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNotice('Selecciona una imagen válida.'); return; }
    if (file.size > 1.5 * 1024 * 1024) { setNotice('Para guardar la vista previa en este navegador, la imagen debe pesar menos de 1.5 MB.'); return; }
    const reader = new FileReader(); reader.onload = () => setImage(String(reader.result || '')); reader.readAsDataURL(file);
  };

  const tabs: { id: Section; label: string; detail: string; icon: React.ElementType; color: string }[] = [
    { id: 'pages', label: 'Little Pages', detail: 'Páginas y proyectos', icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
    { id: 'groups', label: 'Little Groups', detail: 'Clubes y comunidades', icon: Users, color: 'from-violet-500 to-fuchsia-500' },
    { id: 'market', label: 'The Little Market Place', detail: 'Productos para familias', icon: Store, color: 'from-emerald-500 to-teal-500' },
  ];
  return <div className="space-y-5 pb-8">
    <header className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 p-5 sm:p-7 text-white shadow-lg">
      <div className="flex items-start gap-3"><div className="rounded-2xl bg-white/20 p-3"><SparklesFallback /></div><div><p className="text-xs uppercase tracking-[.2em] font-extrabold text-white/80">ClukyBook Community</p><h1 className="text-2xl sm:text-3xl font-black mt-1">Little World</h1><p className="text-sm text-white/90 mt-2 max-w-2xl">Comunidades, creatividad y un mercado pensado para niños con participación y supervisión adulta.</p></div></div>
    </header>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} onClick={() => { setSection(tab.id); setShowCreate(false); setNotice(''); }} className={`text-left rounded-2xl border p-4 transition-all ${section === tab.id ? 'border-transparent bg-white dark:bg-slate-800 shadow-lg ring-2 ring-violet-400' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 hover:shadow-md'}`}><div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tab.color} text-white flex items-center justify-center mb-3`}><Icon className="w-6 h-6"/></div><div className="font-black text-slate-800 dark:text-white">{tab.label}</div><div className="text-xs mt-1 text-slate-500 dark:text-slate-400">{tab.detail}</div></button>; })}</div>
    {notice && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900 px-4 py-3 text-sm flex justify-between gap-3"><span>{notice}</span><button aria-label="Cerrar aviso" onClick={() => setNotice('')}><X className="w-4 h-4"/></button></div>}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="text-xl font-black text-slate-800 dark:text-white">{tabs.find(t => t.id === section)?.label}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{section === 'market' ? 'Explora categorías y crea anuncios con ayuda de un adulto.' : section === 'pages' ? 'Descubre páginas y crea un espacio para compartir intereses.' : 'Encuentra clubes y crea comunidades con reglas claras.'}</p></div><button onClick={() => { setShowCreate(v => !v); setNotice(''); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold px-4 py-3 shadow-md"><Plus className="w-5 h-5"/>{section === 'pages' ? 'Crear página' : section === 'groups' ? 'Crear grupo' : 'Publicar producto'}</button></div>
    {showCreate && <form onSubmit={submit} className="rounded-2xl border border-violet-200 dark:border-violet-900 bg-white dark:bg-slate-800 p-4 sm:p-5 space-y-3 shadow-sm"><div className="flex justify-between items-center"><h3 className="font-black text-lg text-slate-800 dark:text-white">{section === 'pages' ? 'Nueva Little Page' : section === 'groups' ? 'Nuevo Little Group' : 'Nuevo anuncio'}</h3><button type="button" onClick={resetForm} aria-label="Cerrar formulario"><X className="w-5 h-5"/></button></div>
      {section !== 'market' ? <><label className="block text-sm font-bold">Nombre<input required maxLength={70} value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2" placeholder="Nombre de la página o grupo"/></label><label className="block text-sm font-bold">Descripción<textarea required maxLength={500} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2" rows={3} placeholder="¿De qué trata esta comunidad?"/></label><label className="block text-sm font-bold">Categoría<select value={communityCategory} onChange={e => setCommunityCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2"><option>General</option><option>Lectura</option><option>Arte</option><option>Educación</option><option>Juegos</option><option>Deportes</option><option>Música</option><option>Familias</option></select></label>{section === 'groups' && <label className="block text-sm font-bold">Acceso<select value={privacy} onChange={e => setPrivacy(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2"><option>Aprobación de adulto</option><option>Privado</option><option>Público moderado</option></select></label>}</> : <><label className="block text-sm font-bold">Nombre del producto<input required maxLength={100} value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2" placeholder="Ej. Juego de mesa familiar"/></label><label className="block text-sm font-bold">Descripción<textarea required maxLength={1000} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2" rows={3} placeholder="Describe el producto sin incluir datos personales."/></label><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="block text-sm font-bold">Precio (MXN)<input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2" placeholder="0.00"/></label><label className="block text-sm font-bold">Categoría<select value={listingCategory} onChange={e => setListingCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2">{MARKET_CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}</select></label><label className="block text-sm font-bold">Condición<select value={condition} onChange={e => setCondition(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2"><option>Nuevo</option><option>Como nuevo</option><option>Usado en buen estado</option><option>Digital</option></select></label><label className="block text-sm font-bold">Nombre de adulto responsable<input maxLength={60} value={seller} onChange={e => setSeller(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2"/></label></div><label className="block text-sm font-bold">Foto del producto (opcional)<input type="file" accept="image/*" onChange={e => handleImage(e.target.files?.[0])} className="mt-1 block w-full text-sm"/>{image && <img src={image} alt="Vista previa del producto" className="mt-2 h-32 w-32 rounded-xl object-cover"/>}</label></>}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-900 dark:text-amber-200 flex gap-2"><ShieldCheck className="w-5 h-5 shrink-0"/><span>ClukyBook está diseñado para menores: las funciones de publicación requieren una cuenta autenticada y rol de adulto en esta versión. No publiques teléfonos, direcciones, escuela ni datos privados. Los anuncios de venta deben revisarse por un adulto.</span></div><button type="submit" className="w-full sm:w-auto rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold px-5 py-3">{section === 'market' ? 'Guardar anuncio' : 'Crear'}</button></form>}
    {section === 'market' && <><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar juguetes, juegos, libros..." className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-3"/></div><div className="flex gap-2 overflow-x-auto pb-2">{MARKET_CATEGORIES.map(c => <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold border ${category === c ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>{c}</button>)}</div><div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 p-3 text-xs text-sky-900 dark:text-sky-200">Este módulo todavía no procesa pagos ni publica anuncios en otros dispositivos. Antes de abrir ventas reales, conecta una base de datos y almacenamiento seguros, revisión de anuncios, reglas de autorización y un flujo de transacciones supervisado por adultos.</div><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{filteredListings.map(item => <article key={item.id} className="overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">{item.image ? <img src={item.image} alt={item.title} className="w-full h-44 object-cover"/> : <div className="h-44 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 flex items-center justify-center"><Package className="w-16 h-16 text-emerald-500"/></div>}<div className="p-4"><span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-600">{item.category}</span><h3 className="font-black text-slate-800 dark:text-white mt-1">{item.title}</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{item.description}</p><div className="flex items-center justify-between mt-4"><strong className="text-xl text-emerald-700 dark:text-emerald-300">${item.price} MXN</strong><span className="text-xs text-slate-500">{item.condition}</span></div><p className="text-xs text-slate-400 mt-2">Publicado por: {item.seller}</p></div></article>)}{filteredListings.length === 0 && <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center"><div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center"><Store className="w-7 h-7 text-emerald-600"/></div><h3 className="font-black text-slate-800 dark:text-white">Todavía no hay anuncios</h3><p className="text-sm text-slate-500 mt-1">Prueba otra categoría o crea el primer anuncio con supervisión adulta.</p></div>}</div></>}
    {section === 'pages' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pages.map(item => <article key={item.id} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm"><div className="flex gap-3"><div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center"><BookOpen className="w-6 h-6"/></div><div className="flex-1"><span className="text-[11px] uppercase tracking-wide font-extrabold text-blue-600">{item.category}</span><h3 className="font-black text-lg text-slate-800 dark:text-white">{item.name}</h3></div><button aria-label="Guardar página" onClick={() => setNotice('La función de favoritos se conectará al perfil cuando se integre el backend.')}><Heart className="w-5 h-5 text-rose-400"/></button></div><p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{item.description}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-400">Página de la comunidad</span><button onClick={() => setNotice('Vista de página seleccionada. El seguimiento compartido requiere integración con Firebase.')} className="rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-3 py-2 text-xs font-extrabold">Ver página</button></div></article>)}</div>}
    {section === 'groups' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{groups.map(item => <article key={item.id} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm"><div className="flex gap-3"><div className="w-12 h-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-600 flex items-center justify-center"><Users className="w-6 h-6"/></div><div className="flex-1"><span className="text-[11px] uppercase tracking-wide font-extrabold text-fuchsia-600">{item.category}</span><h3 className="font-black text-lg text-slate-800 dark:text-white">{item.name}</h3></div></div><p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{item.description}</p><div className="mt-4 flex items-center justify-between gap-2"><span className="text-xs rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-slate-600 dark:text-slate-300">{item.privacy || 'Moderado'}</span><button onClick={() => setNotice('La solicitud de ingreso se habilitará al conectar los grupos con Firebase y sus reglas de autorización.')} className="rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-700 dark:text-fuchsia-300 px-3 py-2 text-xs font-extrabold">Solicitar ingreso</button></div></article>)}</div>}
  </div>;
};
const SparklesFallback: React.FC = () => <Tag className="w-7 h-7"/>;
