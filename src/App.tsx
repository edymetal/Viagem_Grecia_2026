import { useEffect, useState, type ComponentType } from 'react';
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  Download,
  House,
  Landmark,
  LayoutGrid,
  LoaderCircle,
  MapPinned,
  Moon,
  Menu,
  ShieldCheck,
  Sun,
  Wallet,
  Wifi,
  X,
} from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTravel } from './hooks/useTravel';
import type { Preferences } from './data/schema';
import { athensNow } from './lib/domain';
import { readPreferences } from './lib/backup';
import { Home } from './pages/Home';
import { Itinerary } from './pages/Itinerary';
import { Expenses } from './pages/Expenses';
import { MapPage } from './pages/Map';
import { More } from './pages/More';
import { ItineraryImport } from './components/Planning';

const nav: {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  { id: 'inicio', label: 'Início', icon: House },
  { id: 'roteiro', label: 'Roteiro', icon: CalendarDays },
  { id: 'mapa', label: 'Mapa', icon: MapPinned },
  { id: 'gastos', label: 'Gastos', icon: Wallet },
  { id: 'mais', label: 'Mais', icon: LayoutGrid },
];
const morePages = [
  'mais',
  'documentos',
  'hotel',
  'checklist',
  'informacoes',
  'backup',
  'preferencias',
];
const validPages = [...nav.map((n) => n.id), ...morePages];
const getPage = (route: string) => {
  const page = route.split('/')[0];
  return validPages.includes(page) ? page : 'inicio';
};
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function App() {
  const store = useTravel();
  const [route, setRoute] = useState(() => location.hash.slice(1));
  const page = getPage(route);
  const [now, setNow] = useState(new Date());
  const [preferences, setPref] = useState(readPreferences);
  const [isDark, setIsDark] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [notice, setNotice] = useState('');
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError() {
      setNotice(
        'O cache offline não pôde ser preparado. Conecte-se e recarregue para tentar novamente.',
      );
    },
  });
  useEffect(() => {
    const change = () => setRoute(location.hash.slice(1));
    const tick = setInterval(() => setNow(new Date()), 30_000);
    const connection = () => setOnline(navigator.onLine);
    const prompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallPrompt);
    };
    const installed = () => {
      setInstall(null);
      setNotice('Aplicativo instalado. Confira o indicador de cache antes de usar offline.');
    };
    window.addEventListener('hashchange', change);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    window.addEventListener('beforeinstallprompt', prompt);
    window.addEventListener('appinstalled', installed);
    return () => {
      clearInterval(tick);
      window.removeEventListener('hashchange', change);
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
      window.removeEventListener('beforeinstallprompt', prompt);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const title =
      page === 'roteiro' && route.split('/')[2]
        ? 'Detalhes'
        : nav.find((n) => n.id === page)?.label || 'Mais';
    document.title = `${title} · Atenas 2026`;
  }, [page, route]);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        preferences.theme === 'system' ? (media.matches ? 'dark' : 'light') : preferences.theme;
      setIsDark(document.documentElement.dataset.theme === 'dark');
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preferences.theme]);
  function setPreferences(p: Preferences) {
    setPref(p);
    try {
      localStorage.setItem('atenas-preferences', JSON.stringify(p));
    } catch {
      setNotice('O tema foi aplicado, mas o navegador não permitiu salvar a preferência.');
    }
  }
  const navigate = (target: string) => {
    location.hash = target;
  };
  const active = morePages.includes(page) ? 'mais' : page;
  const time = athensNow(now).time;
  const installApp = async () => {
    if (!install) {
      setInstallHelp((v) => !v);
      return;
    }
    try {
      await install.prompt();
      await install.userChoice;
      setInstall(null);
    } catch {
      setInstallHelp(true);
    }
  };
  return (
    <div className={`app-shell ${page === 'roteiro' ? 'itinerary-page' : ''}`}>
      <a
        href="#conteudo"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('conteudo')?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <a className="brand" href="#inicio">
          <span className="brand-mark">
            <Landmark size={27} strokeWidth={1.5} />
          </span>
          <span>
            atenas<span className="brand-year">2026</span>
          </span>
        </a>
        <p className="sidebar-label">MINHA VIAGEM</p>
        <nav aria-label="Menu principal">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`nav-item ${active === n.id ? 'active' : ''}`}
              aria-current={active === n.id ? 'page' : undefined}
            >
              <n.icon size={20} strokeWidth={1.8} />
              <span>{n.label}</span>
              {active === n.id && <ChevronRight size={15} />}
            </a>
          ))}
        </nav>
        <div className="sidebar-trip">
          <span className="small">DESTINO DOS SONHOS</span>
          <Landmark size={40} strokeWidth={1} />
          <strong>Atenas, Grécia</strong>
          <p>20 — 23 novembro</p>
          <span className="pill">4 dias de descobertas</span>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => navigate('backup')}>
            <Archive size={18} />
            Backup da viagem
          </button>
          <p>
            <ShieldCheck size={14} />
            Privado. Local. Seu.
          </p>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => navigate('mais')}
            aria-label="Abrir menu"
          >
            <Menu size={23} />
          </button>
          <strong className="mobile-page-title">
            {nav.find((n) => n.id === page)?.label ||
              (
                {
                  documentos: 'Documentos',
                  hotel: 'Hotel e reservas',
                  checklist: 'Checklist',
                  informacoes: 'Informações úteis',
                  backup: 'Backup',
                  preferencias: 'Preferências',
                } as Record<string, string>
              )[page] ||
              'Mais'}
          </strong>
          <div className="breadcrumb">
            <span>Minha viagem</span>
            <ChevronRight size={14} />
            <strong>Atenas 2026</strong>
          </div>
          <div className="topbar-actions">
            <span className="athens-clock">
              {time}
              <span> em Atenas</span>
            </span>
            <span
              className={`connection ${online ? '' : 'offline'}`}
              title={
                online
                  ? 'Conexão detectada pelo navegador; serviços externos podem estar indisponíveis.'
                  : 'Navegador sem conexão'
              }
            >
              {online ? <Wifi size={15} /> : <CloudOff size={15} />}
              <span>{online ? 'Online' : 'Offline'}</span>
            </span>
            <button
              className="icon-button theme-button"
              aria-label="Alternar tema claro ou escuro"
              onClick={() =>
                setPreferences({
                  theme: isDark ? 'light' : 'dark',
                })
              }
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="install-button" onClick={() => void installApp()}>
              <Download size={16} />
              <span>Instalar app</span>
            </button>
          </div>
        </header>
        <main id="conteudo" tabIndex={-1}>
          {store.state && <ItineraryImport store={store} />}
          {!online && (
            <div className="notice inline offline-banner" role="status">
              <CloudOff size={18} />
              Você está offline. Use os dados salvos; Google Maps e sites externos precisam de
              internet.
            </div>
          )}
          {offlineReady && (
            <div className="notice inline success" role="status">
              <CheckCircle2 size={18} />
              Aplicativo pronto para uso offline.
              <button
                className="icon-button"
                aria-label="Dispensar aviso de cache"
                onClick={() => setOfflineReady(false)}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {needRefresh && (
            <div className="notice inline" role="status">
              Uma nova versão está disponível.
              <button
                className="text-button"
                disabled={store.busy || !!document.querySelector('dialog[open]')}
                onClick={() => void updateServiceWorker(true)}
              >
                Atualizar aplicativo
              </button>
              <span className="small">Conclua os formulários antes de atualizar.</span>
            </div>
          )}
          {installHelp && (
            <div className="notice inline" role="status">
              <p>
                No Chrome para Android, abra o menu ⋮ e escolha “Adicionar à tela inicial” ou
                “Instalar aplicativo”. A opção depende do navegador e de o app já estar instalado.
                Aguarde o cache inicial antes de usar offline.
              </p>
              <button
                className="icon-button"
                aria-label="Fechar ajuda de instalação"
                onClick={() => setInstallHelp(false)}
              >
                <X size={17} />
              </button>
            </div>
          )}
          {notice && (
            <div className="notice inline" role="status">
              {notice}
              <button
                className="icon-button"
                aria-label="Dispensar mensagem"
                onClick={() => setNotice('')}
              >
                <X size={17} />
              </button>
            </div>
          )}
          {store.error && (
            <div className="error-box inline" role="alert">
              <p>{store.error}</p>
              {store.state ? (
                <button
                  className="icon-button"
                  aria-label="Dispensar erro"
                  onClick={store.clearError}
                >
                  <X size={17} />
                </button>
              ) : (
                <button className="button secondary" onClick={() => location.reload()}>
                  Tentar novamente
                </button>
              )}
            </div>
          )}
          {!store.state ? (
            <div className="loading" role="status">
              <LoaderCircle className="spin" size={28} />
              <h2>{store.error ? 'Seus dados precisam de atenção' : 'Preparando sua viagem…'}</h2>
              <p className="muted">
                {store.error
                  ? 'Permita o armazenamento local para continuar com segurança.'
                  : 'Carregando os dados deste dispositivo.'}
              </p>
            </div>
          ) : page === 'inicio' ? (
            <Home store={store} navigate={navigate} now={now} />
          ) : page === 'roteiro' ? (
            <Itinerary store={store} now={now} route={route} />
          ) : page === 'mapa' ? (
            <MapPage store={store} navigate={navigate} />
          ) : page === 'gastos' ? (
            <Expenses store={store} now={now} />
          ) : (
            <More
              section={page}
              navigate={navigate}
              store={store}
              preferences={preferences}
              setPreferences={setPreferences}
            />
          )}
        </main>
        <footer className="app-footer">
          <Landmark size={15} />
          <span>Atenas 2026</span>
          <span>Feito para explorar, com tudo por perto.</span>
          <span>Europe/Athens · €</span>
          <a
            className="photo-credit"
            href={`${import.meta.env.BASE_URL}images/CREDITS.md`}
            target="_blank"
            rel="noreferrer"
          >
            Créditos e licenças das fotos
          </a>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Navegação inferior">
        {nav.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={active === n.id ? 'active' : ''}
            aria-current={active === n.id ? 'page' : undefined}
          >
            <span>
              <n.icon size={22} strokeWidth={active === n.id ? 2.2 : 1.7} />
            </span>
            <small>{n.label}</small>
          </a>
        ))}
      </nav>
    </div>
  );
}
