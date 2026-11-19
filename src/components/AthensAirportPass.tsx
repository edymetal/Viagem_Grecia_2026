import { MetroPhoto } from './MetroPhoto';

export function AthensAirportPass({ stage }: { stage: 'walk' | 'buy' }) {
  if (stage === 'walk') {
    return (
      <section className="card detail-section" aria-labelledby="athens-airport-walk">
        <h3 id="athens-airport-walk">Do desembarque à máquina</h3>
        <ol className="airport-pass-steps">
          <li>
            Siga <strong lang="en">Arrivals</strong> (Chegadas). Se despachou mala, retire-a em{' '}
            <strong lang="en">Baggage Claim</strong> e siga para o saguão público de chegadas.
          </li>
          <li>
            Procure as placas <strong lang="en">To Trains &amp; Long-Term Parking</strong> e suba um
            andar pelo elevador ou pela escada rolante. A passarela fica no nível de{' '}
            <strong lang="en">Departures</strong> (Partidas), na área pública.
          </li>
          <li>
            Atravesse a passarela coberta com esteira rolante até o prédio separado da estação{' '}
            <strong lang="en">Airport Railway Station</strong>. Conte cerca de 5–10 minutos de
            caminhada a partir da área pública do terminal.
          </li>
          <li>
            No saguão da estação, antes das catracas, procure as máquinas de bilhetes do metrô{' '}
            <strong>ATH.ENA Ticket</strong> ou a bilheteria <strong>STASY / Metro</strong>.
          </li>
        </ol>
        <p className="detail-description">
          Mostre a frase abaixo para perguntar onde fica a máquina do metrô.
        </p>
        <blockquote className="airport-pass-phrase" lang="el">
          Πού είναι το μηχάνημα έκδοσης εισιτηρίων του μετρό;
        </blockquote>
        <MetroPhoto id="airportBridge" />
        <div className="detail-external-links">
          <a
            href="https://media.aia.gr/assets/aiaportal/media/root/traveller/shop-and-dining/aia_sc_map_dec_2025.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Mapa oficial do terminal (estação marcada como ARS) ↗
          </a>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="card detail-section" aria-labelledby="athens-airport-purchase">
        <h3 id="athens-airport-purchase">Como comprar na máquina</h3>
        <ol className="airport-pass-steps">
          <li>
            Selecione <strong lang="en">English</strong> (inglês) e depois{' '}
            <strong lang="en">Buy Ticket</strong> ou <strong lang="en">Buy Travel Product</strong>{' '}
            (comprar bilhete).
          </li>
          <li>
            No menu de tarifas, procure <strong lang="en">3-Day Tourist Ticket</strong> ou{' '}
            <strong lang="en">3 Days</strong>. Se a máquina mostrar categorias, abra{' '}
            <strong lang="en">Athens &amp; Airport, Round</strong> e procure os 3 dias dentro dela.
            Antes de pagar, confira <strong>1 bilhete, 3 dias e € 20</strong>. Se aparecer € 9 ou €
            16 no menu rápido, volte à lista de tarifas.
          </li>
          <li>
            Pague com cartão no leitor da máquina ou selecione <strong lang="en">Cash</strong>{' '}
            (dinheiro), se disponível. Retire o bilhete físico <strong>ATH.ENA Ticket</strong>, o
            recibo e o eventual troco na bandeja.
          </li>
        </ol>
        <p className="detail-description">
          Se precisar de ajuda, mostre a frase abaixo no guichê do metrô. O horário publicado pela
          STASY para a sexta-feira é das 06h às 23h30.
        </p>
        <blockquote className="airport-pass-phrase" lang="el">
          Δεν μιλάω αγγλικά. Θα ήθελα ένα τουριστικό εισιτήριο τριών ημερών, με μία διαδρομή από το
          αεροδρόμιο και μία επιστροφή στο αεροδρόμιο με το μετρό. Ευχαριστώ!
        </blockquote>
        <div className="detail-external-links">
          <a
            href="https://www.oasa.gr/en/tickets/useful-information/reloading-guide/"
            target="_blank"
            rel="noreferrer"
          >
            Guia ilustrado das máquinas · OASA ↗
          </a>
          <a
            href="https://www.stasy.gr/en/tickets-cards/ticket-offices-working-hours/"
            target="_blank"
            rel="noreferrer"
          >
            Horário da bilheteria · STASY ↗
          </a>
        </div>
      </section>

      <section className="card detail-section" aria-labelledby="athens-airport-validation">
        <h3 id="athens-airport-validation">Validar e embarcar</h3>
        <ol className="airport-pass-steps">
          <li>
            Encoste o <strong>bilhete físico</strong> no leitor azul da catraca na entrada e na
            saída do metrô. Use o mesmo bilhete nos ônibus e bondes urbanos, validando ao embarcar.
          </li>
          <li>
            Siga o painel da <strong>linha 3 azul · Dimotiko Theatro</strong> e desça em{' '}
            <strong>Syntagma</strong>. Para o hotel, troque para a linha 2 sentido Elliniko e desça
            em Syngrou-Fix. O trem suburbano aparece como <strong>Proastiakos</strong> no painel.
          </li>
          <li>
            As <strong>72 horas</strong> começam na primeira catraca. Se validar às 19h15 de sexta
            (20/11), o passe vale até 19h15 de segunda (23/11), no horário de Atenas. O mesmo
            bilhete cobre o percurso do aeroporto até a cidade na sexta e a volta ao aeroporto na
            segunda de manhã.
          </li>
        </ol>
        <MetroPhoto id="airportGates" />
      </section>
    </>
  );
}
