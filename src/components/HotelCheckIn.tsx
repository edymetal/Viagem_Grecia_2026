import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import { Modal } from './ui';

const storageKey = 'ilissos-check-in-2026';

// The personal link carries the voucher details in its fragment, on the device only.
function readVoucher(value: string) {
  const params = new URLSearchParams(value);
  const guest = params.get('guest')?.trim();
  const confirmation = params.get('confirmation') ?? '';
  const booking = params.get('booking') ?? '';
  if (guest && guest.length <= 100 && /^\d{16}$/.test(confirmation) && /^\d{16}$/.test(booking)) {
    return { guest, confirmation, booking };
  }
}

export function HotelCheckIn({ route }: { route: string }) {
  const [language, setLanguage] = useState<'el' | 'en'>();
  const [voucher, setVoucher] = useState(() => {
    try {
      return readVoucher(localStorage.getItem(storageKey) ?? '');
    } catch {
      return undefined;
    }
  });
  useEffect(() => {
    const [page, date, activity, fragment] = route.split('/');
    if (!fragment) return;
    const details = readVoucher(fragment);
    if (!details) return;
    setVoucher(details);
    try {
      localStorage.setItem(storageKey, new URLSearchParams(details).toString());
      if (location.hash.slice(1) === route) {
        history.replaceState(history.state, '', `#${page}/${date}/${activity}`);
      }
    } catch {
      // The current visit can still display the details when persistence is unavailable.
    }
  }, [route]);
  const greek = language === 'el';
  return (
    <>
      <button className="button" onClick={() => setLanguage('el')} aria-haspopup="dialog">
        <Languages size={19} /> Mostrar à recepção
      </button>
      {language && (
        <Modal title="Ilissos Hotel" onClose={() => setLanguage(undefined)}>
          <div className="reception-languages" role="group" aria-label="Idioma da mensagem">
            {(['el', 'en'] as const).map((code) => (
              <button
                key={code}
                className={language === code ? 'button' : 'button secondary'}
                aria-pressed={language === code}
                onClick={() => setLanguage(code)}
              >
                {code === 'el' ? 'Grego' : 'Inglês'}
              </button>
            ))}
          </div>
          <article className="reception-message" lang={language}>
            {greek ? (
              <>
                <p>
                  Γεια σας!{' '}
                  {voucher && (
                    <>
                      Ονομάζομαι <strong>{voucher.guest}</strong>.{' '}
                    </>
                  )}
                  Έχω κάνει κράτηση στο ξενοδοχείο Ilissos μέσω της <strong>Trip.com</strong>. Θα
                  ήθελα να κάνω check-in.
                </p>
                <p>
                  Έχω κλείσει ένα μονόκλινο δωμάτιο με πρωινό για τρεις νύχτες,{' '}
                  <strong>από τις 20 έως τις 23 Νοεμβρίου 2026</strong>. Έχω ήδη πληρώσει{' '}
                  <strong>135,67 €</strong> μέσω της Trip.com. Απομένουν <strong>9 €</strong> για το
                  περιβαλλοντικό τέλος.
                </p>
              </>
            ) : (
              <>
                <p>
                  Hello!{' '}
                  {voucher && (
                    <>
                      My name is <strong>{voucher.guest}</strong>.{' '}
                    </>
                  )}
                  I have a reservation at the Ilissos Hotel through <strong>Trip.com</strong>. I’d
                  like to check in, please.
                </p>
                <p>
                  I booked a standard single room with breakfast for three nights,{' '}
                  <strong>from 20 to 23 November 2026</strong>. I’ve already paid{' '}
                  <strong>€135.67</strong> through Trip.com. My confirmation shows that I have{' '}
                  <strong>€9</strong> left to pay for the environmental fee.
                </p>
              </>
            )}
            {voucher && (
              <dl>
                <dt>{greek ? 'Αριθμός επιβεβαίωσης' : 'Confirmation number'}</dt>
                <dd>{voucher.confirmation}</dd>
                <dt>{greek ? 'Αριθμός κράτησης Trip.com' : 'Trip.com booking number'}</dt>
                <dd>{voucher.booking}</dd>
              </dl>
            )}
            <p>
              {greek
                ? 'Δεν μιλάω αγγλικά. Μιλάω πορτογαλικά και καταλαβαίνω ιταλικά. Αν χρειάζεστε κάτι από εμένα, μπορείτε να μου το γράψετε για να το μεταφράσω στο κινητό μου; Ευχαριστώ πολύ!'
                : 'I don’t speak English. I speak Portuguese and understand Italian. If you need anything from me, could you please write it down so I can translate it on my phone? Thank you!'}
            </p>
          </article>
        </Modal>
      )}
    </>
  );
}
