import { useEffect, useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
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

function isFileError(error: unknown, name: string) {
  return error instanceof DOMException && error.name === name;
}

export function LinkedPdfFolder() {
  const supported = canPickPdfFolder();
  const [folder, setFolder] = useState<PdfDirectory>();
  const [pdfs, setPdfs] = useState<FolderPdf[]>([]);
  const [loading, setLoading] = useState(supported);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supported) return;
    let active = true;
    void (async () => {
      try {
        const saved = await loadPdfFolder();
        if (!active || !saved) return;
        setFolder(saved);
        const access = await saved.queryPermission?.({ mode: 'read' });
        if (access && access !== 'granted') {
          if (active) setNeedsPermission(true);
          return;
        }
        const files = await listFolderPdfs(saved);
        if (active) setPdfs(files);
      } catch (error) {
        if (!active) return;
        if (isFileError(error, 'NotAllowedError')) setNeedsPermission(true);
        else setError('Escolha a pasta Viagem novamente para acessar os PDFs.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [supported]);

  async function connect(reuseFolder: boolean) {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const reconnecting = reuseFolder && folder?.requestPermission;
      const directory = reconnecting ? folder : await pickPdfFolder();
      if (!directory) return;
      if (reconnecting && (await directory.requestPermission?.({ mode: 'read' })) !== 'granted') {
        setError('Permita a leitura da pasta para abrir os PDFs.');
        return;
      }
      const files = await listFolderPdfs(directory);
      setFolder(directory);
      setPdfs(files);
      setNeedsPermission(false);
      if (!reconnecting) {
        try {
          await rememberPdfFolder(directory);
        } catch {
          setError('A pasta está disponível nesta sessão. Escolha-a novamente ao voltar ao app.');
        }
      }
    } catch (error) {
      if (isFileError(error, 'AbortError')) return;
      setError('Não foi possível acessar a pasta. Escolha Viagem novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function viewPdf(pdf: FolderPdf) {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await openFolderPdf(pdf);
    } catch (error) {
      if (isFileError(error, 'NotAllowedError')) {
        setNeedsPermission(true);
      } else if (isFileError(error, 'NotFoundError') && folder) {
        setError('O PDF mudou de lugar. Escolha a pasta novamente para atualizar a lista.');
      } else {
        setError(
          `Não foi possível abrir ${pdf.file.name}. Confira se o PDF abre no aplicativo Arquivos.`,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="local-pdf-folder" aria-label="PDFs do dispositivo">
      <div className="section-title">
        <h2>
          Pasta {folder?.name ?? 'Viagem'}
          {pdfs.length > 0 && <span className="count-badge">{pdfs.length}</span>}
        </h2>
        {supported && (
          <div className="inline">
            {needsPermission && folder && (
              <button className="button" disabled={loading} onClick={() => void connect(true)}>
                Autorizar acesso à pasta
              </button>
            )}
            <button
              className={folder ? 'button secondary' : 'button'}
              disabled={loading}
              onClick={() => void connect(false)}
            >
              <FolderOpen size={17} /> {folder ? 'Escolher outra pasta' : 'Escolher pasta Viagem'}
            </button>
          </div>
        )}
      </div>
      {!supported ? (
        <p className="notice">Este navegador não permite ao app acessar a pasta diretamente. No roteiro, selecione o PDF indicado em cada atividade para abri-lo.</p>
      ) : !folder ? (
        <p className="muted small">
          No Android, selecione <strong>Armazenamento interno → Documents → Viagem</strong>.
        </p>
      ) : needsPermission ? (
        <p className="muted small">Autorize a leitura da pasta para abrir os PDFs.</p>
      ) : (
        !loading &&
        !pdfs.length &&
        !error && <p className="muted small">A pasta selecionada está sem PDFs.</p>
      )}
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
      {!needsPermission && pdfs.length > 0 && (
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
                <strong>{pdf.file.name}</strong>
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
