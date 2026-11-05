import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  FileText,
  Hotel,
  MapPin,
  Plane,
  Wallet,
  Clock3,
} from 'lucide-react';
import type { TravelStore } from '../hooks/useTravel';
import { athensNow, countdown, dateLabel, euro, nextActivity, totals } from '../lib/domain';
import { Scenery } from '../components/Scenery';
import { MapsLinks } from '../components/ui';

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
  const days = countdown(now);
  const current = athensNow(now);
  const next = nextActivity(state.activities, now);
  const total = totals(state);
  const dayIndex = state.days.findIndex((d) => d.date === current.date);
  return (
    <>
      <div className="home-heading">
        <div>
          <p className="eyebrow">SUA PRÓXIMA HISTÓRIA</p>
          <h1>
            Olá, viajante<span className="coral">.</span>
          </h1>
          <p className="muted">Um pouco de organização. Muito para descobrir.</p>
        </div>
        <span className="pill">
          <CalendarDays size={14} />
          20–23 NOV, 2026
        </span>
      </div>
      <section className="hero">
        <Scenery />
        <div className="hero-content">
          <span className="hero-tag">
            <span /> GRÉCIA · 4 DIAS · 1 PESSOA
          </span>
          <h2>
            Atenas
            <br />
            <em>nos espera.</em>
          </h2>
          <p>
            Seu companheiro de viagem,
            <br />
            do planejamento às boas memórias.
          </p>
          <button className="button cream" onClick={() => navigate('roteiro')}>
            Explorar meu roteiro <ArrowUpRight size={18} />
          </button>
          <div className="hero-route">
            <Plane size={17} />
            <span>
              Palermo <ArrowRight size={14} /> Atenas
            </span>
          </div>
        </div>
        <div className="countdown">
          <span>{days > 0 ? 'FALTAM' : dayIndex >= 0 ? 'APROVEITE' : 'ATÉ A PRÓXIMA'}</span>
          <strong>{days > 0 ? days : dayIndex >= 0 ? `${dayIndex + 1}/4` : '✓'}</strong>
          <span>
            {days > 0 ? 'DIAS PARA EMBARCAR' : dayIndex >= 0 ? 'DIA DA VIAGEM' : 'VIAGEM ENCERRADA'}
          </span>
        </div>
      </section>
      <div className="section-title">
        <h2>Uma viagem, quatro capítulos</h2>
        <button className="text-button" onClick={() => navigate('roteiro')}>
          Ver roteiro <ArrowRight size={15} />
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
            <span className="day-num">0{i + 1}</span>
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
              <Clock3 size={20} />
            </span>
            <h2>Próxima parada</h2>
            {next && <span className="badge">Confirmada</span>}
          </div>
          {next ? (
            <div className="next-content">
              <p className="eyebrow">
                {dateLabel(next.date)} · {next.start} · ATENAS
              </p>
              <h3>{next.title}</h3>
              <p className="muted">
                <MapPin size={15} />
                {next.address || 'Endereço ainda não informado'}
              </p>
              <MapsLinks address={next.address} />
            </div>
          ) : (
            <div className="next-content">
              <h3>O melhor ainda está por vir</h3>
              <p className="muted">
                Seu cronograma está a caminho. Assim que houver uma atividade confirmada com
                horário, ela aparecerá aqui.
              </p>
              <button className="text-button" onClick={() => navigate('roteiro')}>
                Organizar atividades <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>
        <section className="card budget-card">
          <div className="card-heading">
            <span className="icon-tile warm">
              <Wallet size={20} />
            </span>
            <h2>De olho nos gastos</h2>
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
              Detalhes <ArrowUpRight size={15} />
            </button>
          </div>
        </section>
      </div>
      <div className="quick-grid">
        <button className="quick-card" onClick={() => navigate('documentos')}>
          <span className="icon-tile">
            <FileText />
          </span>
          <div>
            <strong>Meus documentos</strong>
            <span>
              {store.documents.length
                ? `${store.documents.length} arquivos neste dispositivo`
                : 'Tudo à mão, mesmo offline'}
            </span>
          </div>
          <ArrowUpRight size={18} />
        </button>
        <button className="quick-card" onClick={() => navigate('hotel')}>
          <span className="icon-tile warm">
            <Hotel />
          </span>
          <div>
            <strong>Minha hospedagem</strong>
            <span>{state.hotel.name || 'Adicione os dados do hotel'}</span>
          </div>
          <ArrowUpRight size={18} />
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
      <p className="footnote">Planeje no seu ritmo. Seus dados ficam apenas neste dispositivo.</p>
    </>
  );
}
