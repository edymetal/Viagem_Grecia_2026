import { useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { connectPdfFolder, usePdfFolder } from '../hooks/usePdfFolder';
import { canPickPdfFolder, openFolderPdf, type FolderPdf } from '../lib/pdfFolder';

export function LinkedPdfFolder() {
  const supported = canPickPdfFolder();
  const { folder, name, pdfs, ready, loading, message } = usePdfFolder();
  const [error, setError] = useState('');

  async function viewPdf(pdf: FolderPdf) {
    setError('');
    try {
      await openFolderPdf(pdf);
    } catch {
      setError(
        `Não foi possível abrir ${pdf.path}. Atualize os PDFs da pasta ou abra o arquivo no celular.`,
      );
    }
  }
  return (
    <section className="local-pdf-folder" aria-label="PDFs do dispositivo">
      <div className="section-title">
        <h2>
          Pasta {name ?? 'Viagem'}
          {pdfs.length > 0 && <span className="count-badge">{pdfs.length}</span>}
        </h2>
        {supported && (
          <div className="inline">
            {folder && (
              <button
                className="button"
                disabled={loading}
                onClick={() => {
                  setError('');
                  void connectPdfFolder();
                }}
              >
                {ready ? 'Atualizar PDFs' : 'Autorizar acesso à pasta'}
              </button>
            )}
            <button
              className={name ? 'button secondary' : 'button'}
              disabled={loading}
              onClick={() => {
                setError('');
                void connectPdfFolder(false);
              }}
            >
              <FolderOpen size={17} /> {name ? 'Escolher outra pasta' : 'Escolher pasta Viagem'}
            </button>
          </div>
        )}
      </div>
      {!supported && !ready ? (
        <p className="notice">
          Este navegador não permite ao app acessar a pasta diretamente. No roteiro, selecione o PDF
          indicado em cada atividade para abri-lo.
        </p>
      ) : !name ? (
        <p className="muted small">
          No Android, selecione <strong>Armazenamento interno → Documents → Viagem</strong>.
        </p>
      ) : (
        !loading &&
        !pdfs.length &&
        !error && <p className="muted small">A pasta selecionada está sem PDFs.</p>
      )}
      {(error || message) && (
        <p className="error-box" role="alert">
          {error || message}
        </p>
      )}
      {pdfs.length > 0 && (
        <div className="document-grid" aria-busy={loading}>
          {pdfs.map((pdf) => (
            <button
              key={pdf.path}
              className="card document-card linked-pdf"
              disabled={loading}
              aria-label={`Abrir ${pdf.path}`}
              onClick={() => void viewPdf(pdf)}
            >
              <span className="icon-tile">
                <FileText size={20} />
              </span>
              <span>
                <strong>{pdf.path.split('/').at(-1)}</strong>
                {pdf.path.includes('/') && (
                  <small className="muted">{pdf.path.slice(0, pdf.path.lastIndexOf('/'))}</small>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
