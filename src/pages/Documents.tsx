import { useEffect, useState } from 'react';
import { Download, FileText, HardDrive, Image, LockKeyhole, Plus, Trash2 } from 'lucide-react';
import { documentCategories, documentMetaSchema, type LocalDocument } from '../data/schema';
import type { TravelStore } from '../hooks/useTravel';
import { downloadBlob, verifyFile } from '../lib/backup';
import { AsyncForm, Empty, Field, Modal, value } from '../components/ui';

export function Documents({ store }: { store: TravelStore }) {
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<LocalDocument | null>(null);
  const [removing, setRemoving] = useState<LocalDocument | null>(null);
  const [storageMessage, setStorageMessage] = useState('');
  const used = store.documents.reduce((n, d) => n + d.size, 0);
  return (
    <>
      <div className="notice privacy">
        <LockKeyhole size={20} />
        <div>
          <strong>Seus documentos ficam com você</strong>
          <p>
            Arquivos guardados apenas neste navegador e dispositivo, sem envio para servidores. Se
            os dados do navegador forem apagados, eles poderão ser perdidos. Mantenha um backup
            seguro.
          </p>
        </div>
      </div>
      <div className="section-title">
        <h2>
          Documentos e reservas <span className="count-badge">{store.documents.length}</span>
        </h2>
        <button className="button" onClick={() => setAdding(true)}>
          <Plus size={17} />
          Adicionar arquivo
        </button>
      </div>
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
        <Modal title="Adicionar documento" onClose={() => setAdding(false)}>
          <AsyncForm
            label="Guardar neste dispositivo"
            onSave={async (f) => {
              const file = f.get('file');
              if (!(file instanceof File) || file.size === 0)
                throw new Error('Selecione um arquivo válido.');
              const meta = documentMetaSchema.safeParse({
                id: crypto.randomUUID(),
                name: file.name,
                category: value(f, 'category'),
                type: file.type,
                size: file.size,
                createdAt: new Date().toISOString(),
              });
              if (!meta.success) throw new Error('Use PDF, PNG, JPEG ou WebP de até 10 MB.');
              await verifyFile(file, file.type);
              await store.addDocument({ ...meta.data, blob: file });
              setAdding(false);
            }}
          >
            <div className="form-grid">
              <Field label="Categoria" wide>
                <select name="category">
                  {documentCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="PDF ou imagem (PNG, JPEG, WebP) · até 10 MB" wide>
                <input
                  name="file"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  required
                />
              </Field>
              <p className="small muted wide">
                Para guardar códigos QR, adicione a imagem ou PDF que contém o código. Nenhum
                documento é incluído no código-fonte.
              </p>
            </div>
          </AsyncForm>
        </Modal>
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
function DocumentViewer({
  document: doc,
  onClose,
}: {
  document: LocalDocument;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const u = URL.createObjectURL(doc.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [doc]);
  return (
    <Modal title={doc.name} onClose={onClose}>
      <div className="document-viewer">
        {url &&
          (doc.type === 'application/pdf' ? (
            <iframe title={`PDF: ${doc.name}`} src={url} />
          ) : (
            <img src={url} alt={doc.name} />
          ))}
      </div>
      <p className="muted small">
        Se o navegador não exibir o PDF, baixe para abrir em um leitor no dispositivo.
      </p>
      <button className="button" onClick={() => downloadBlob(doc.blob, doc.name)}>
        <Download size={17} />
        Baixar arquivo
      </button>
    </Modal>
  );
}
