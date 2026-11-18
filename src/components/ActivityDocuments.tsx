import { useEffect, useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { activityPdfs, matchesPdfRule, type TripPdfRule } from '../data/activityPdfs';
import type { Activity } from '../data/schema';
import {
  canPickPdfFolder,
  listFolderPdfs,
  loadPdfFolder,
  openFolderPdf,
  pickPdfFolder,
  rememberPdfFolder,
  type FolderPdf,
  type PdfDirectory,
} from '../lib/pdfFolder';

export function ActivityDocuments({ activity }: { activity: Activity }) {
  const rules = activityPdfs(activity);
  const supported = canPickPdfFolder();
  const [folder, setFolder] = useState<PdfDirectory>();
  const [pdfs, setPdfs] = useState<FolderPdf[]>([]);
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<{ label: string; name: string; url: string }>();
  useEffect(() => {
    if (!supported || !rules.length) return;
    let active = true;
    setScanned(false);
    void (async () => {
      try {
        const saved = await loadPdfFolder();
        if (!saved || !active) return;
        setFolder(saved);
        const permission = await saved.queryPermission?.({ mode: 'read' });
        if (permission && permission !== 'granted') return;
        const files = await listFolderPdfs(saved);
        if (active) {
          setPdfs(files);
          setScanned(true);
        }
      } catch {
        if (active) setMessage('Escolha a pasta Viagem novamente para acessar os documentos.');
      }
    })();
    return () => {
      active = false;
    };
  }, [activity.id, supported]);
  useEffect(
    () => () => {
      if (selected) URL.revokeObjectURL(selected.url);
    },
    [selected],
  );
  if (!rules.length) return null;
  async function connect() {
    setMessage('');
    try {
      let directory = folder;
      if (directory?.requestPermission) {
        if ((await directory.requestPermission({ mode: 'read' })) !== 'granted') {
          setMessage('Permita a leitura da pasta para abrir os documentos.');
          return;
        }
      } else directory = await pickPdfFolder();
      if (!directory) return;
      const files = await listFolderPdfs(directory);
      setFolder(directory);
      setPdfs(files);
      setScanned(true);
      try {
        await rememberPdfFolder(directory);
      } catch {
        setMessage('A pasta está disponível apenas nesta sessão.');
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError'))
        setMessage('Não foi possível acessar a pasta. Confira a permissão e tente novamente.');
    }
  }
  async function open(pdf: FolderPdf) {
    try {
      setMessage('');
      await openFolderPdf(pdf);
    } catch {
      setScanned(false);
      setMessage('Não foi possível abrir o PDF. Confira o arquivo e autorize a pasta novamente.');
    }
  }
  function selectFile(file: File | undefined, rule: TripPdfRule) {
    setSelected(undefined);
    setMessage('');
    if (!file) return;
    if (!matchesPdfRule(file.name, rule)) {
      setMessage(
        'O nome do arquivo escolhido não corresponde a esta opção. Confira o PDF selecionado.',
      );
      return;
    }
    setSelected({ label: rule.label, name: file.name, url: URL.createObjectURL(file) });
  }
  const filesByRule = rules.map((rule) => ({
    rule,
    matches: pdfs.filter((pdf) => matchesPdfRule(pdf.path, rule)),
  }));
  const missing = filesByRule
    .filter(({ matches }) => !matches.length)
    .map(({ rule }) => rule.label);
  return (
    <section
      className="card detail-section activity-documents"
      aria-label="Documentos desta atividade"
    >
      <h3>Documentos</h3>
      {supported && !scanned && (
        <div className="activity-document-item">
          <button className="button secondary" onClick={() => void connect()}>
            <FolderOpen size={17} /> {folder ? 'Autorizar acesso à pasta' : 'Escolher pasta Viagem'}
          </button>
        </div>
      )}
      {supported &&
        scanned &&
        filesByRule.flatMap(({ rule, matches }) =>
          matches.map((pdf) => (
            <div className="activity-document-item" key={`${rule.label}-${pdf.path}`}>
              <button className="button secondary" onClick={() => void open(pdf)}>
                <FileText size={17} /> Abrir{' '}
                {matches.length === 1 ? rule.label.toLocaleLowerCase('pt-BR') : pdf.path}
              </button>
              {matches.length === 1 && <small className="muted">{pdf.path}</small>}
            </div>
          )),
        )}
      {supported && scanned && missing.length > 0 && (
        <p className="small muted activity-document-item">
          Confira na pasta Viagem {missing.join(', ').toLocaleLowerCase('pt-BR')}.
        </p>
      )}
      {!supported &&
        rules.map((rule) => (
          <div key={rule.label} className="activity-document-item">
            {selected?.label === rule.label && (
              <>
                <a className="button" href={selected.url} target="_blank" rel="noopener noreferrer">
                  <FileText size={17} /> Abrir PDF selecionado
                </a>
                <small className="muted">{selected.name}</small>
              </>
            )}
            <label className="button secondary">
              <FolderOpen size={17} />{' '}
              {selected?.label === rule.label
                ? 'Trocar arquivo'
                : `Selecionar ${rule.label.toLocaleLowerCase('pt-BR')}`}
              <input
                className="activity-pdf-input"
                type="file"
                accept="application/pdf,.pdf"
                aria-label={`Selecionar ${rule.label}`}
                onChange={(event) => {
                  selectFile(event.currentTarget.files?.[0], rule);
                  event.currentTarget.value = '';
                }}
              />
            </label>
          </div>
        ))}
      {message && (
        <p className="error-box" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
