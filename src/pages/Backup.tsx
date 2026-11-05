import { useState } from 'react';
import { Download, ShieldCheck, Upload } from 'lucide-react';
import type { Preferences } from '../data/schema';
import type { TravelStore } from '../hooks/useTravel';
import { createBackup, downloadBlob, parseBackup } from '../lib/backup';
import { AsyncForm, Field, Modal } from '../components/ui';

export function BackupPage({
  store,
  preferences,
  setPreferences,
}: {
  store: TravelStore;
  preferences: Preferences;
  setPreferences: (p: Preferences) => void;
}) {
  const [include, setInclude] = useState(false);
  const [pending, setPending] = useState<Awaited<ReturnType<typeof parseBackup>> | null>(null);
  const [message, setMessage] = useState('');
  return (
    <>
      <div className="notice privacy">
        <ShieldCheck size={22} />
        <div>
          <strong>Você controla suas cópias</strong>
          <p>
            Backups são baixados manualmente como JSON. Nada é enviado automaticamente para
            servidores. Guarde o arquivo em um local seguro.
          </p>
        </div>
      </div>
      <div className="backup-grid">
        <section className="card backup-card">
          <span className="icon-tile">
            <Download />
          </span>
          <h2>Leve uma cópia com você</h2>
          <p className="muted">
            Exporte roteiro, despesas, orçamento, hotel, reservas, informações úteis, checklist e
            tema.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={include}
              onChange={(e) => setInclude(e.target.checked)}
            />
            Incluir documentos e imagens locais
          </label>
          <p className="small notice">
            {include
              ? 'O JSON incluirá seus arquivos pessoais, sem criptografia, e poderá ficar grande. Não compartilhe nem adicione ao GitHub.'
              : 'Documentos e fotografias NÃO serão incluídos. Para levá-los a outro dispositivo, marque a opção acima.'}
          </p>
          <AsyncForm
            label="Exportar backup"
            onSave={async () => {
              const backup = await createBackup(
                store.state!,
                preferences,
                include ? store.documents : undefined,
              );
              downloadBlob(
                new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
                `atenas-2026-backup-${new Date().toISOString().slice(0, 10)}.json`,
              );
              setMessage(
                `Backup exportado ${include ? 'com documentos' : 'sem documentos'}. Guarde o arquivo em segurança.`,
              );
            }}
          >
            <span />
          </AsyncForm>
        </section>
        <section className="card backup-card">
          <span className="icon-tile warm">
            <Upload />
          </span>
          <h2>Restaurar uma viagem</h2>
          <p className="muted">
            Selecione um backup criado por este aplicativo. A estrutura e a versão serão verificadas
            antes de qualquer alteração.
          </p>
          <AsyncForm
            label="Verificar backup"
            onSave={async (f) => {
              const file = f.get('backup');
              if (!(file instanceof File) || !file.size)
                throw new Error('Selecione o arquivo JSON.');
              if (file.size > 80 * 1024 * 1024) throw new Error('O limite do backup é 80 MB.');
              setPending(await parseBackup(await file.text()));
            }}
          >
            <Field label="Arquivo JSON de backup">
              <input type="file" name="backup" accept="application/json,.json" required />
            </Field>
          </AsyncForm>
        </section>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {pending && (
        <Modal title="Confirmar restauração" onClose={() => setPending(null)}>
          <p>
            Backup de{' '}
            {new Date(pending.exportedAt).toLocaleString('pt-BR', { timeZone: 'Europe/Athens' })}{' '}
            (horário de Atenas).
          </p>
          <ul className="restore-list">
            <li>{pending.data.activities.length} atividades</li>
            <li>{pending.data.expenses.length} despesas</li>
            <li>{pending.data.checklist.length} itens de checklist</li>
            <li>Hotel, reservas, informações e preferências</li>
          </ul>
          <div className="notice warning">
            <strong>Os dados atuais serão substituídos.</strong>
            <p>
              {pending.documents !== undefined
                ? `${pending.documents.length} documentos do backup substituirão TODOS os documentos locais, inclusive se a lista estiver vazia.`
                : 'Este backup não inclui documentos. Os arquivos que já estão neste dispositivo serão mantidos; arquivos ausentes não serão restaurados.'}
            </p>
          </div>
          <AsyncForm
            label="Restaurar dados"
            onSave={async () => {
              const ids = new Set((pending.documents ?? store.documents).map((d) => d.id));
              const next = structuredClone(pending.data);
              next.activities.forEach((a) => {
                if (a.photoDocumentId && !ids.has(a.photoDocumentId)) a.photoDocumentId = null;
              });
              next.reservations.forEach((r) => {
                if (r.documentId && !ids.has(r.documentId)) r.documentId = null;
              });
              await store.restore(next, pending.documents);
              setPreferences(pending.preferences);
              setPending(null);
              setMessage('Dados restaurados neste dispositivo.');
            }}
          >
            <label className="check-label">
              <input type="checkbox" required />
              Entendo que os dados atuais serão substituídos.
            </label>
          </AsyncForm>
        </Modal>
      )}
    </>
  );
}
