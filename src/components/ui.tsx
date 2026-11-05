import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { ArrowUpRight, X, MapPin, Footprints, TrainFront, Inbox, LoaderCircle } from 'lucide-react';
import { mapsLink } from '../lib/domain';

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Inbox size={25} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const id = useId();
  return (
    <div className={wide ? 'field wide' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog ref={ref} className="modal" onCancel={onClose} aria-label={title}>
      <div className="modal-heading">
        <h2>{title}</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar janela">
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function AsyncForm({
  children,
  onSave,
  label = 'Salvar alterações',
}: {
  children: ReactNode;
  onSave: (data: FormData) => Promise<void>;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave(new FormData(event.currentTarget));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <fieldset disabled={busy}>{children}</fieldset>
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      <div className="form-footer">
        <span>Salvo apenas neste dispositivo</span>
        <button className="button" disabled={busy}>
          {busy && <LoaderCircle className="spin" size={16} />}
          {busy ? 'Salvando…' : label}
        </button>
      </div>
    </form>
  );
}
export function MapsLinks({ address, origin }: { address: string; origin?: string }) {
  if (!address)
    return <p className="small muted">Adicione um endereço para abrir a localização.</p>;
  return (
    <div className="map-links">
      <a href={mapsLink(address)} target="_blank" rel="noreferrer">
        <MapPin size={16} /> Localização
        <ArrowUpRight size={13} />
      </a>
      <a href={mapsLink(address, 'walking', origin)} target="_blank" rel="noreferrer">
        <Footprints size={16} /> A pé
      </a>
      <a href={mapsLink(address, 'transit', origin)} target="_blank" rel="noreferrer">
        <TrainFront size={16} /> Transporte público
      </a>
    </div>
  );
}
export const value = (f: FormData, key: string) => String(f.get(key) ?? '').trim();
export const optionalNumber = (f: FormData, key: string) =>
  value(f, key) === '' ? null : Number(value(f, key));
export function ValidationError(error: { issues: { message: string; path: PropertyKey[] }[] }) {
  return new Error(error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'));
}
export function LocalImage({
  blob,
  alt,
  className,
}: {
  blob: Blob;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url ? <img src={url} alt={alt} className={className} loading="lazy" /> : null;
}
