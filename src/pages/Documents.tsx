import { useEffect, useState } from 'react';
import { Download, FileText, HardDrive, Image, LockKeyhole, Plus, Trash2 } from 'lucide-react';
import { documentCategories, type LocalDocument } from '../data/schema';
import type { TravelStore } from '../hooks/useTravel';
import { downloadBlob } from '../lib/backup';
import { prepareLocalDocuments } from '../lib/documents';
import { AsyncForm, Empty, Field, Modal, value } from '../components/ui';
import { LinkedPdfFolder } from '../components/LinkedPdfFolder';

export function Documents({ store }: { store: TravelStore }) {
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<LocalDocument | null>(null);
  const [removing, setRemoving] = useState<LocalDocument | null>(null);
  const [storageMessage, setStorageMessage] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const used = store.documents.reduce((n, d) => n + d.size, 0);
  return (
    <>
      <div className="notice privacy">
        <LockKeyhole size={20} />
        <div>
          <strong>Seus documentos ficam com você</strong>
          <p>
            Os PDFs da pasta Viagem são guardados neste dispositivo para uso offline. Ao adicionar
            ou trocar arquivos na pasta, toque em Atualizar PDFs.
          </p>
        </div>
      </div>
      <LinkedPdfFolder />
      <div className="section-title">
        <h2>
          Arquivos salvos no app <span className="count-badge">{store.documents.length}</span>
        </h2>
        <button
          className="button"
          onClick={() => {
            setImportMessage('');
            setAdding(true);
          }}
        >
          <Plus size={17} />
          Adicionar arquivo
        </button>
      </div>
      {importMessage && (
        <p className="notice success" role="status">
          {importMessage}
        </p>
      )}
      {!store.documents.length ? (
        <section className="card">
          <Empty title="O essencial, sempre com você">
            Adicione passagens, reservas, ingressos ou códigos QR como PDF ou imagem. Os arquivos
            ficam disponíveis offline neste dispositivo.
          </Empty>
        </section>
      ) : (
        <div className="document-grid">
          {store.documents.map((d) => (
            <article className="card document-card" key={d.id}>
              <span className="icon-tile">
                {d.type === 'application/pdf' ? <FileText /> : <Image />}
              </span>
              <span className="badge neutral">{d.category}</span>
              <h3>{d.name}</h3>
              <p className="muted small">{(d.size / 1024).toFixed(0)} KB · Disponível offline</p>
              <div className="document-actions">
                <button className="button secondary" onClick={() => setViewing(d)}>
                  Abrir
                </button>
                <button
                  className="icon-button"
                  aria-label={`Baixar ${d.name}`}
                  onClick={() => downloadBlob(d.blob, d.name)}
                >
                  <Download size={18} />
                </button>
                <button
                  className="icon-button danger"
                  aria-label={`Excluir ${d.name}`}
                  onClick={() => setRemoving(d)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <section className="card storage-card">
        <div>
          <h3>
            <HardDrive size={18} />
            Armazenamento local
          </h3>
          <p className="muted small">
            {(used / 1024 / 1024).toFixed(1)} MB de 50 MB de documentos · Até 10 MB por arquivo.
          </p>
          <p className="small muted">
            O navegador pode liberar espaço automaticamente. A proteção depende de suporte e
            permissão do navegador.
          </p>
          {storageMessage && (
            <p role="status" className="small">
              {storageMessage}
            </p>
          )}
        </div>
        <button
          className="button secondary"
          onClick={async () => {
            try {
              const granted = await navigator.storage?.persist?.();
              setStorageMessage(
                granted
                  ? 'Armazenamento persistente concedido. Limpar os dados manualmente ainda remove os arquivos.'
                  : 'Proteção não concedida por este navegador. Mantenha um backup.',
              );
            } catch {
              setStorageMessage('Não foi possível solicitar proteção. Mantenha um backup.');
            }
          }}
        >
          Proteger dados locais
        </button>
      </section>
      {adding && (
        <DocumentImporter
          store={store}
          onClose={() => setAdding(false)}
          onSaved={(count) => {
            setImportMessage(
              count === 0
                ? 'Os arquivos selecionados já estão no app.'
                : count === 1
                  ? 'Arquivo guardado neste dispositivo.'
                  : `${count} arquivos guardados neste dispositivo.`,
            );
            setAdding(false);
          }}
        />
      )}
      {viewing && <DocumentViewer document={viewing} onClose={() => setViewing(null)} />}
      {removing && (
        <Modal title="Excluir documento local?" onClose={() => setRemoving(null)}>
          <p>{removing.name}</p>
          <AsyncForm
            label="Excluir documento"
            onSave={async () => {
              await store.deleteDocument(removing.id);
              setRemoving(null);
            }}
          >
            <p className="muted">
              O arquivo e os vínculos com atividades ou reservas serão removidos. Salve uma cópia se
              precisar dele depois.
            </p>
          </AsyncForm>
        </Modal>
      )}
    </>
  );
}

function DocumentImporter({
  store,
  onClose,
  onSaved,
}: {
  store: TravelStore;
  onClose: () => void;
  onSaved: (count: number) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Modal title="Adicionar documentos" onClose={onClose}>
      <AsyncForm
        label="Guardar neste dispositivo"
        onSave={async (form) => {
          const documents = await prepareLocalDocuments(
            files,
            value(form, 'category'),
            store.documents,
          );
          onSaved(await store.addDocuments(documents));
        }}
      >
        <div className="form-grid">
          <Field label="PDF ou imagem (seleção múltipla) · até 10 MB por arquivo" wide>
            <input
              type="file"
              accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
              multiple
              onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []))}
            />
          </Field>
          {files.length > 0 && (
            <p className="small wide" role="status">
              {files.length === 1 ? files[0].name : `${files.length} arquivos selecionados`}
            </p>
          )}
          <Field label="Categoria" wide>
            <select name="category">
              {documentCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </Field>
        </div>
      </AsyncForm>
    </Modal>
  );
}

function DocumentViewer({
  document: doc,
  onClose,
}: {
  document: LocalDocument;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const isPdf = doc.type === 'application/pdf';
  const showInline =
    !isPdf || (navigator.pdfViewerEnabled !== false && !/Android/i.test(navigator.userAgent));
  useEffect(() => {
    const u = URL.createObjectURL(doc.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [doc]);
  return (
    <Modal title={doc.name} onClose={onClose}>
      {url && showInline && (
        <div className="document-viewer">
          {isPdf ? (
            <iframe title={`PDF: ${doc.name}`} src={url} />
          ) : (
            <img src={url} alt={doc.name} />
          )}
        </div>
      )}
      <div className="inline">
        {url && isPdf && (
          <a className="button" href={url} target="_blank" rel="noopener noreferrer">
            <FileText size={17} /> Abrir PDF no navegador
          </a>
        )}
        <button
          className={isPdf ? 'button secondary' : 'button'}
          onClick={() => downloadBlob(doc.blob, doc.name)}
        >
          <Download size={17} />
          Baixar arquivo
        </button>
      </div>
      {isPdf && (
        <p className="muted small">
          Você também pode abrir o PDF baixado pelo aplicativo Arquivos do celular.
        </p>
      )}
    </Modal>
  );
}
