import { MapPin, Ticket } from 'lucide-react';
import { mapsLink } from '../lib/domain';

export function LeonardoExpressGuide({ fromAirport }: { fromAirport: boolean }) {
  const departure = fromAirport ? 'Fiumicino Aeroporto' : 'Roma Termini';
  const arrival = fromAirport ? 'Roma Termini' : 'Fiumicino Aeroporto';

  return (
    <section className="card detail-section metro-guide" aria-labelledby="leonardo-ticket-guide">
      <h3 id="leonardo-ticket-guide">
        <Ticket size={19} aria-hidden="true" /> Leonardo Express · Como comprar na máquina
      </h3>
      <p className="airport-pass-fare">
        1 adulto · Só ida · Trem direto (32 min) <strong>€ 14</strong>
      </p>
      <ol className="metro-steps" role="list">
        <li>
          <h4>Encontre a máquina da Trenitalia</h4>
          {fromAirport ? (
            <>
              <p>
                Siga <strong lang="it">Arrivi</strong> (chegadas) no Terminal 1. Se despachou mala,
                retire-a em <strong lang="it">Ritiro bagagli</strong>. Se vir uma máquina vermelha
                da Trenitalia junto às esteiras, você já pode comprar com cartão ali.
              </p>
              <p>
                No saguão público, siga o símbolo de trem e as placas{' '}
                <strong lang="en">Train</strong> até a{' '}
                <strong lang="it">Stazione Fiumicino Aeroporto</strong>, perto do Terminal 3. Se as
                placas levarem pelo T3, siga a passarela sinalizada no{' '}
                <strong lang="it">Piano 2</strong> (nível 2). Na estação, procure as máquinas da
                Trenitalia ou o guichê <strong lang="it">Biglietteria</strong> antes das catracas.
              </p>
              <a
                className="metro-map-link"
                href={mapsLink('Stazione ferroviaria Fiumicino Aeroporto, Fiumicino')}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin size={16} aria-hidden="true" /> Abrir estação no mapa
              </a>
            </>
          ) : (
            <p>
              No saguão principal de Roma Termini, procure as máquinas vermelhas da Trenitalia,
              identificadas como <strong lang="it">Biglietti</strong>.
            </p>
          )}
        </li>
        <li>
          <h4>Abra o menu de compra e escolha o destino</h4>
          <p>
            Se houver seleção de idioma, escolha <strong lang="it">Italiano</strong>. Na tela
            inicial, procure{' '}
            <strong className="airport-pass-option" lang="it">
              Compra biglietto
            </strong>{' '}
            (comprar bilhete). Se a tela já pedir a estação de chegada, vá direto ao destino.
          </p>
          <p>
            Confira <strong lang="it">Partenza</strong> (origem) como{' '}
            <strong lang="it">{departure}</strong>. Em <strong lang="it">Arrivo</strong> ou{' '}
            <strong lang="it">Destinazione</strong> (destino), selecione{' '}
            <strong className="airport-pass-option" lang="it">
              {arrival}
            </strong>
            .
          </p>
        </li>
        <li>
          <h4>Escolha o Leonardo Express e confira a tarifa</h4>
          <p>
            Se aparecerem opções de data ou passageiros, escolha <strong lang="it">Oggi</strong>{' '}
            (hoje) e <strong lang="it">1 adulto</strong> para viajar no mesmo dia. Na lista de
            horários, escolha o <strong>Leonardo Express</strong> direto. Confira{' '}
            <strong className="airport-pass-option" lang="it">
              Ordinaria
            </strong>{' '}
            (tarifa normal), <strong>€ 14</strong> e um só trecho (
            <strong lang="it">Solo andata</strong>).
          </p>
          <p className="airport-pass-tip">
            Se aparecer a linha <strong>FL1</strong> ou um trajeto com troca de trem, volte à lista
            e procure o <strong>Leonardo Express</strong> direto.
          </p>
          <p>
            {fromAirport ? (
              <>Escolha a próxima saída para a qual você consegue chegar à plataforma.</>
            ) : (
              <>
                Para a saída planejada das 10h05, procure o trem 4682, com chegada às 10h37, e
                confirme no painel.
              </>
            )}
          </p>
        </li>
        <li>
          <h4>Avance, pague e retire o bilhete</h4>
          <p>
            Procure{' '}
            <strong className="airport-pass-option" lang="it">
              Avanti
            </strong>{' '}
            (avançar). Se aparecerem ofertas de passeios, procure a opção de ir para o pagamento (
            <strong lang="it">Vai al pagamento</strong>) e prossiga sem marcar extras.
          </p>
          <p>
            Escolha{' '}
            <strong className="airport-pass-option" lang="it">
              Carte
            </strong>{' '}
            (cartão) e siga as instruções do leitor. Para dinheiro, use{' '}
            <strong lang="it">Contanti</strong> quando disponível. Retire o bilhete impresso.
          </p>
        </li>
        <li>
          <h4>Confira a plataforma e valide antes de embarcar</h4>
          <p>
            No painel <strong lang="it">Partenze</strong> (partidas), procure{' '}
            <strong lang="it">{arrival}</strong> e confira horário, número do trem e{' '}
            <strong lang="it">Binario</strong> (plataforma). Valide o bilhete de papel na
            {fromAirport ? ' catraca da estação' : ' validadora ou catraca da estação'} antes de
            embarcar e guarde-o até sair da estação de destino.
          </p>
          {fromAirport ? (
            <p>
              Se a catraca só ler o código do papel, confirme a validação na máquina da plataforma
              antes de embarcar. O bilhete digital da Trenitalia se ativa no horário do trem
              escolhido.
            </p>
          ) : (
            <p>
              Em Termini, as plataformas dedicadas são <strong>23 e 24</strong>. Siga o número que
              aparecer no painel para a sua saída.
            </p>
          )}
        </li>
      </ol>
      <p className="detail-description">
        Os nomes e a ordem dos botões podem variar conforme a máquina. Em Fiumicino, uma tela em
        inglês mostrou <strong lang="en">Forward</strong> (avançar),{' '}
        <strong lang="en">Go to payment</strong> (ir para o pagamento) e{' '}
        <strong lang="en">Cards</strong> (cartões).
      </p>
      <h4>Frase em italiano para mostrar na bilheteria</h4>
      <blockquote className="airport-pass-phrase" lang="it">
        Buongiorno, vorrei un biglietto di sola andata per {arrival} con il Leonardo Express, per
        favore.
      </blockquote>
      <details className="metro-sources">
        <summary>Compra por aproximação e fontes</summary>
        <p className="detail-description">
          Com <strong>Tap&amp;Tap</strong>, aproxime seu cartão, celular ou relógio no leitor
          identificado para o Leonardo Express antes de embarcar e aguarde a confirmação. O embarque
          já é pago nessa etapa. A Trenitalia dispensa o tap de saída nesse trajeto.
        </p>
        <div className="detail-external-links">
          {fromAirport && (
            <a
              href="https://www.adr.it/documents/10157/15959937/MappaFiumicinoarrivi_ita20190102.pdf/847f9cd7-afa7-48ba-a7e4-a9c266c47143"
              target="_blank"
              rel="noreferrer"
            >
              Mapa do Terminal 1 até a estação ↗
            </a>
          )}
          <a
            href="https://www.trenitalia.com/it/informazioni/biglietterie-selfservice.html"
            target="_blank"
            rel="noreferrer"
          >
            Máquinas e meios de pagamento · Trenitalia ↗
          </a>
          <a
            href="https://www.trenitalia.com/it/informazioni/tap-and-tap.html"
            target="_blank"
            rel="noreferrer"
          >
            Regras do Tap&amp;Tap · Trenitalia ↗
          </a>
          <a
            href="https://costabitaitabi.com/en/2026/11/08/rome-how-to-ride-the-leonardo-express-from-fiumicino-airport-to-termini-station-a-firsthand-guide/"
            target="_blank"
            rel="noreferrer"
          >
            Fotos das telas em Fiumicino ↗
          </a>
        </div>
      </details>
    </section>
  );
}
