import { useEffect, useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { activityPdfs, matchesPdfRule, type TripPdfRule } from '../data/activityPdfs';
import type { Activity } from '../data/schema';
import { connectPdfFolder, usePdfFolder } from '../hooks/usePdfFolder';
import { canPickPdfFolder, openFolderPdf, type FolderPdf } from '../lib/pdfFolder';

export function ActivityDocuments({ activity }: { activity: Activity }) {
  const rules = activityPdfs(activity);
  const supported = canPickPdfFolder();
  const { folder, pdfs, ready, loading, message: folderMessage } = usePdfFolder();
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<{ label: string; name: string; url: string }>();
  useEffect(
    () => () => {
      if (selected) URL.revokeObjectURL(selected.url);
    },
    [selected],
  );
  if (!rules.length) return null;
  async function open(pdf: FolderPdf) {
    try {
      setMessage('');
      await openFolderPdf(pdf);
    } catch {
      setMessage('Não foi possível abrir o PDF. Confira o arquivo na aba Documentos.');
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
      {loading && !ready && <p className="small muted">Carregando PDFs…</p>}
      {supported && !ready && !loading && (
        <div className="activity-document-item">
          <button
            className="button secondary"
            onClick={() => void connectPdfFolder()}
          >
            <FolderOpen size={17} /> {folder ? 'Autorizar acesso à pasta' : 'Escolher pasta Viagem'}
          </button>
        </div>
      )}
      {ready &&
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
      {supported && ready && missing.length > 0 && (
        <p className="small muted activity-document-item">
          Confira na aba Documentos {missing.join(', ').toLocaleLowerCase('pt-BR')}.
        </p>
      )}
      {!supported &&
        filesByRule
          .filter(({ matches }) => !matches.length)
          .map(({ rule }) => (
            <div key={rule.label} className="activity-document-item">
              {selected?.label === rule.label && (
                <>
                  <a
                    className="button"
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
      {(message || folderMessage) && (
        <p className="error-box" role="status">
          {message || folderMessage}
        </p>
      )}
    </section>
  );
}
