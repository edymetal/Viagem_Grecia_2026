import {
  CalendarDays,
  CheckCheck,
  ChevronRight,
  ClipboardCheck,
  Coins,
  FileText,
  Hotel,
  MapPin,
  Plane,
  Wallet,
  Clock3,
  Navigation,
  Map,
} from 'lucide-react';
import type { TravelStore } from '../hooks/useTravel';
import {
  athensNow,
  countdown,
  dateLabel,
  euro,
  nextActivity,
  totals,
  mapDestination,
  zoneLabel,
} from '../lib/domain';
import { PlanningNotice } from '../components/Planning';
import { MapsLinks } from '../components/ui';
import { parthenonPhoto } from '../components/ActivityVisual';

export function Home({
  store,
  navigate,
  now,
}: {
  store: TravelStore;
  navigate: (page: string) => void;
  now: Date;
}) {
  const state = store.state!;
  const days = countdown(now),
    current = athensNow(now),
    next = nextActivity(state.activities, now),
    total = totals(state);
  const dayIndex = state.days.findIndex((d) => d.date === current.date);
  const shortcuts = [
    {
      label: 'Planejar viagem',
      detail: 'Preparativos e confirmações',
      page: 'checklist',
      icon: CalendarDays,
      color: 'red',
    },
    {
      label: 'Ver roteiro',
      detail: 'Sua programação, dia a dia',
      page: 'roteiro',
      icon: Map,
      color: 'blue',
    },
    {
      label: 'Explorar mapa',
      detail: 'Destinos e deslocamentos',
      page: 'mapa',
      icon: MapPin,
      color: 'red',
    },
    {
      label: 'Meus documentos',
      detail: 'Bilhetes e reservas offline',
      page: 'documentos',
      icon: FileText,
      color: 'amber',
    },
  ];
  return (
    <>
      <div className="home-heading">
        <div>
          <h1>
            Olá, viajante<span className="coral">.</span>
          </h1>
          <p className="muted">Sua viagem a Atenas, em um só lugar.</p>
        </div>
        <span className="pill">
          <Plane size={14} />
          Palermo → Atenas
        </span>
      </div>
      <section className="hero photo-hero">
        <img
          className="hero-photo"
          src={parthenonPhoto}
          alt="Vista da Acrópole e do Partenon em Atenas"
          fetchPriority="high"
        />
        <div className="hero-content">
          <span className="hero-tag">MINHA VIAGEM · GRÉCIA</span>
          <h2>Atenas</h2>
          <p>Sua viagem a Atenas</p>
          <div className="hero-meta">
            <span>
              <CalendarDays size={16} />
              20–23 nov 2026
            </span>
            <span>
              <Clock3 size={16} />4 dias
            </span>
          </div>
        </div>
        <div className="countdown">
          <span>{days > 0 ? 'FALTAM' : dayIndex >= 0 ? 'DIA' : 'VIAGEM'}</span>
          <strong>{days > 0 ? days : dayIndex >= 0 ? `${dayIndex + 1}/4` : '✓'}</strong>
          <span>{days > 0 ? 'DIAS' : dayIndex >= 0 ? 'EM ATENAS' : 'CONCLUÍDA'}</span>
        </div>
      </section>
      <nav className="home-shortcuts" aria-label="Atalhos da viagem">
        {shortcuts.map((s) => (
          <button key={s.page} onClick={() => navigate(s.page)}>
            <span className={`shortcut-icon ${s.color}`}>
              <s.icon size={26} strokeWidth={1.9} />
            </span>
            <span>
              <strong>{s.label}</strong>
              <small>{s.detail}</small>
            </span>
            <ChevronRight size={20} />
          </button>
        ))}
      </nav>
      <section className="trip-summary card">
        <h2>Resumo da viagem</h2>
        <div className="summary-cells">
          <button onClick={() => navigate('roteiro')}>
            <CalendarDays className="blue" size={24} />
            <strong>4 dias</strong>
            <span>20 a 23 de novembro</span>
          </button>
          <button onClick={() => navigate('roteiro')}>
            <MapPin className="red" size={24} />
            <strong>{state.activities.length} atividades</strong>
            <span>{state.activities.filter((a) => a.completed).length} concluídas</span>
          </button>
          <button onClick={() => navigate('gastos')}>
            <Coins className="amber" size={24} />
            <strong>{euro(total.actual)}</strong>
            <span>Gastos realizados</span>
          </button>
        </div>
      </section>
      <PlanningNotice store={store} />
      <div className="section-title">
        <h2>Seus dias em Atenas</h2>
        <button className="text-button" onClick={() => navigate('roteiro')}>
          Ver todos <ChevronRight size={16} />
        </button>
      </div>
      <div className="day-overview">
        {state.days.map((d, i) => (
          <button
            key={d.date}
            className={`day-tile ${current.date === d.date ? 'today' : ''}`}
            onClick={() => {
              sessionStorage.setItem('selected-day', d.date);
              navigate('roteiro');
            }}
          >
            <span className="day-num">{i + 1}</span>
            <div>
              <strong>{dateLabel(d.date, { weekday: 'long' })}</strong>
              <span>{dateLabel(d.date, { day: '2-digit', month: 'long' })}</span>
            </div>
            <span className="day-count">
              {current.date === d.date
                ? 'Hoje'
                : `${state.activities.filter((a) => a.date === d.date).length} atividades`}
            </span>
          </button>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="card next-card">
          <div className="card-heading">
            <span className="icon-tile">
              <Navigation size={20} />
            </span>
            <h2>Próxima parada</h2>
            {next && <span className="badge">{next.confirmation}</span>}
          </div>
          {next ? (
            <div className="next-content">
              <p className="eyebrow">
                {dateLabel(next.date)} · {next.start} · {zoneLabel(next)}
              </p>
              <h3>{next.title}</h3>
              <p className="muted">
                <MapPin size={15} />
                {mapDestination(next) || 'Endereço ainda não informado'}
              </p>
              {next.timeCertainty && (
                <p className="small muted">
                  Horário: {next.timeCertainty}. {next.timeNote}
                </p>
              )}
              <MapsLinks address={mapDestination(next)} />
            </div>
          ) : (
            <div className="next-content">
              <h3>Consulte sua programação</h3>
              <p className="muted">
                Nenhuma atividade planejada ou confirmada com horário está por vir. Consulte os dias
                e as sugestões no roteiro.
              </p>
              <button className="text-button" onClick={() => navigate('roteiro')}>
                Organizar atividades <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
        <section className="card budget-card">
          <div className="card-heading">
            <span className="icon-tile warm">
              <Wallet size={20} />
            </span>
            <h2>Controle de gastos</h2>
          </div>
          <span className="small muted">Total realizado</span>
          <strong className="money-large">{euro(total.actual)}</strong>
          <div className="progress">
            <span
              style={{
                width: `${state.budget ? Math.min((total.actual / state.budget) * 100, 100) : 0}%`,
              }}
            />
          </div>
          <div className="budget-caption">
            <span>
              {state.budget === null
                ? 'Orçamento a definir'
                : `de ${euro(state.budget)} de orçamento`}
            </span>
            <button className="text-button" onClick={() => navigate('gastos')}>
              Detalhes <ChevronRight size={15} />
            </button>
          </div>
        </section>
      </div>
      <div className="quick-grid">
        <button className="quick-card" onClick={() => navigate('hotel')}>
          <span className="icon-tile warm">
            <Hotel />
          </span>
          <div>
            <strong>Minha hospedagem</strong>
            <span>{state.hotel.name || 'Adicione os dados do hotel'}</span>
          </div>
          <ChevronRight size={18} />
        </button>
        <button className="quick-card" onClick={() => navigate('checklist')}>
          <span className="icon-tile">
            <ClipboardCheck />
          </span>
          <div>
            <strong>Checklist da viagem</strong>
            <span>
              {state.checklist.filter((c) => c.done).length} de {state.checklist.length}{' '}
              preparativos concluídos
            </span>
          </div>
          <ChevronRight size={18} />
        </button>
        <div className="quick-card visited">
          <span className="icon-tile">
            <CheckCheck />
          </span>
          <div>
            <strong>
              {state.activities.filter((a) => a.completed).length} de {state.activities.length}{' '}
              atividades
            </strong>
            <span>Concluídas no seu roteiro</span>
          </div>
        </div>
      </div>
      <p className="footnote">
        Seu roteiro, suas contas e seus documentos ficam neste dispositivo.
      </p>
    </>
  );
}
