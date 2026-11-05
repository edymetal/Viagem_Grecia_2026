import { useEffect, useRef, useState } from 'react';
import type { AppState, LocalDocument } from '../data/schema';
import {
  loadState,
  saveState,
  listDocuments,
  restoreState,
  addDocument,
  deleteDocument,
} from '../lib/storage';

export function useTravel() {
  const [state, setState] = useState<AppState | null>(null);
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const current = useRef<AppState | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pendingOperations = useRef(0);
  useEffect(() => {
    let active = true;
    Promise.all([loadState(), listDocuments()])
      .then(([s, d]) => {
        if (active) {
          current.current = s;
          setState(s);
          setDocuments(d);
        }
      })
      .catch(() => {
        if (active)
          setError(
            'Não foi possível abrir os dados locais. Verifique se o armazenamento do navegador está permitido e recarregue a página. Seus dados não foram substituídos.',
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const run = (operation: () => Promise<void>) => {
    pendingOperations.current++;
    setBusy(true);
    const task = queue.current.then(operation).catch((e) => {
      const message = e instanceof Error ? e.message : 'Não foi possível salvar.';
      setError(
        `Não foi possível concluir. ${(e instanceof DOMException && e.name === 'QuotaExceededError') || /quota/i.test(message) ? 'Armazenamento cheio. Exporte um backup e libere espaço.' : message}`,
      );
      throw e;
    });
    queue.current = task
      .catch(() => undefined)
      .finally(() => {
        pendingOperations.current--;
        if (pendingOperations.current === 0) setBusy(false);
      });
    return task;
  };
  const update = (fn: (state: AppState) => AppState) =>
    run(async () => {
      if (!current.current) throw new Error('Aguarde o carregamento dos dados.');
      const next = fn(structuredClone(current.current));
      await saveState(next);
      current.current = next;
      setState(next);
    });
  return {
    state,
    documents,
    error,
    busy,
    clearError: () => setError(''),
    update,
    addDocument: (document: LocalDocument) =>
      run(async () => {
        await addDocument(document);
        setDocuments(await listDocuments());
      }),
    deleteDocument: (id: string) =>
      run(async () => {
        await deleteDocument(id);
        const s = await loadState();
        current.current = s;
        setState(s);
        setDocuments(await listDocuments());
      }),
    restore: (next: AppState, docs?: LocalDocument[]) =>
      run(async () => {
        await restoreState(next, docs);
        current.current = next;
        setState(next);
        setDocuments(await listDocuments());
      }),
  };
}
export type TravelStore = ReturnType<typeof useTravel>;
