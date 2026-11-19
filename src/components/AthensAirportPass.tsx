import { Ticket } from 'lucide-react';
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
      <section
        className="card detail-section metro-guide"
        aria-labelledby="athens-airport-purchase"
      >
        <h3 id="athens-airport-purchase">
          <Ticket size={19} aria-hidden="true" /> Como comprar na máquina
        </h3>
        <p className="airport-pass-fare">
          1 bilhete, 3 dias e <strong>€ 20</strong>
        </p>
        <ol className="metro-steps" role="list">
          <li>
            <h4>Abra o menu de compra</h4>
            <p>
              Toque em{' '}
              <strong className="airport-pass-option" lang="en">
                English
              </strong>{' '}
              (inglês). Depois, escolha{' '}
              <strong className="airport-pass-option" lang="en">
                Buy Ticket
              </strong>{' '}
              ou{' '}
              <strong className="airport-pass-option" lang="en">
                Buy Travel Product
              </strong>{' '}
              (comprar bilhete).
            </p>
          </li>
          <li>
            <h4>Escolha o passe de 3 dias</h4>
            <p>
              Procure{' '}
              <strong className="airport-pass-option" lang="en">
                3-Day Tourist Ticket
              </strong>{' '}
              ou{' '}
              <strong className="airport-pass-option" lang="en">
                3 Days
              </strong>
              . Se houver categorias, abra{' '}
              <strong className="airport-pass-option" lang="en">
                Athens &amp; Airport, Round
              </strong>{' '}
              (ida e volta) e selecione os 3 dias.
            </p>
            <p className="airport-pass-tip">
              Viu <strong>€ 9</strong> ou <strong>€ 16</strong> no menu rápido? Volte à lista de
              tarifas e selecione o passe de <strong>€ 20</strong>.
            </p>
          </li>
          <li>
            <h4>Pague e retire o bilhete</h4>
            <p>
              Use o cartão no leitor ou selecione{' '}
              <strong className="airport-pass-option" lang="en">
                Cash
              </strong>{' '}
              (dinheiro), se disponível. Pegue o <strong>ATH.ENA Ticket</strong>, o recibo e o
              eventual troco na bandeja.
            </p>
          </li>
        </ol>
        <h4>Frase em grego para mostrar na bilheteria</h4>
        <p className="detail-description">Horário de sexta-feira · 06h–23h30</p>
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
