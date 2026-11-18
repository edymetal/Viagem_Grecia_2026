import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deleteDB } from 'idb';
import { emptyState as initialState } from '../src/data/initial';
import {
  addDocument,
  addDocuments,
  deleteDocument,
  listDocuments,
  loadState,
  restoreState,
  saveState,
} from '../src/lib/storage';
import { createBackup, parseBackup } from '../src/lib/backup';
import { prepareLocalDocuments } from '../src/lib/documents';
import { MAX_LOCAL_DOCUMENTS, type LocalDocument } from '../src/data/schema';
import { previousItinerary } from '../src/lib/itinerary';
import { ITINERARY_REVISION } from '../src/data/itinerary';

const doc = (): LocalDocument => {
  const blob = new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' });
  return {
    id: 'teste-local',
    name: 'teste.pdf',
    category: 'Outros',
    type: 'application/pdf',
    size: blob.size,
    createdAt: new Date().toISOString(),
    blob,
  };
};
beforeEach(async () => {
  await saveState(initialState());
});
afterEach(async () => {
  await deleteDB('atenas-2026');
});
describe('armazenamento e backup', () => {
  it('importa PDFs selecionados em lote e conserva vínculos de importações antigas', async () => {
    const original = doc();
    await addDocument(original);
    const files = [
      new File([original.blob], original.name, { type: 'application/octet-stream' }),
      new File(['%PDF-1.4\n% outro\n%%EOF'], 'outro.PDF'),
    ];
    const selected = await prepareLocalDocuments(files, 'Ingresso', await listDocuments());
    expect(selected[0].id).toBe(original.id);
    expect(selected[1].blob.type).toBe('application/pdf');
    expect(await addDocuments(selected)).toBe(1);
    const reimport = await prepareLocalDocuments(files, 'Ingresso', await listDocuments());
    expect(await addDocuments(reimport)).toBe(0);
    expect(await listDocuments()).toHaveLength(2);
  });

  it('rejeita um lote acima da capacidade sem deixar arquivos parcialmente salvos', async () => {
    const template = doc();
    await addDocuments(
      Array.from({ length: MAX_LOCAL_DOCUMENTS - 1 }, (_, index) => ({
        ...template,
        id: `existente-${index}`,
      })),
    );
    await expect(addDocuments([template, { ...template, id: 'novo' }])).rejects.toThrow(
      '100 documentos',
    );
    expect(await listDocuments()).toHaveLength(MAX_LOCAL_DOCUMENTS - 1);
  });

  it('migra o cronograma antigo uma vez e mantém o arquivo pessoal no IndexedDB', async () => {
    const old = previousItinerary();
    old.activities[0].photoDocumentId = 'teste-local';
    old.activities[0].notes = 'Nota particular';
    await saveState(old);
    await addDocument(doc());
    const corrected = await loadState();
    expect(corrected.itineraryRevision).toBe(ITINERARY_REVISION);
    expect(corrected.activities).toHaveLength(91);
    expect(corrected.activities[0].photoDocumentId).toBe('teste-local');
    expect(corrected.activities[0].notes).toBe('Nota particular');
    expect(corrected.activities.find((a) => a.id === 'plan-1-13')!.start).toBe('20:20');
    expect(await loadState()).toEqual(corrected);
    expect(await (await listDocuments())[0].blob.text()).toContain('%PDF');
  });
  it('reverte estado e coleção inteira se uma restauração falha no meio', async () => {
    const previous = initialState();
    previous.budget = 60;
    await saveState(previous);
    await addDocument(doc());
    const next = initialState();
    next.budget = 999;
    const sameId = { ...doc(), id: 'duplicado' };
    await expect(restoreState(next, [sameId, sameId])).rejects.toThrow();
    expect((await loadState()).budget).toBe(60);
    expect((await listDocuments()).map((d) => d.id)).toEqual(['teste-local']);
  });
  it('persiste dados e arquivos, e desfaz vínculos ao excluir documentos', async () => {
    const s = initialState();
    s.budget = 300;
    s.reservations.push({
      id: 'r',
      title: 'Teste',
      reference: '',
      notes: '',
      documentId: 'teste-local',
    });
    await saveState(s);
    await addDocument(doc());
    expect((await loadState()).budget).toBe(300);
    expect((await listDocuments())[0].size).toBe(doc().size);
    await deleteDocument('teste-local');
    expect(await listDocuments()).toHaveLength(0);
    expect((await loadState()).reservations[0].documentId).toBeNull();
  });
  it('exporta sem documentos por padrão e preserva arquivos na restauração sem anexos', async () => {
    await addDocument(doc());
    const backup = await createBackup(initialState(), { theme: 'dark' });
    expect(backup.documents).toBeUndefined();
    const parsed = await parseBackup(JSON.stringify(backup));
    await restoreState(parsed.data, parsed.documents);
    expect(await listDocuments()).toHaveLength(1);
    expect(parsed.preferences.theme).toBe('dark');
  });
  it('restaura documentos incluídos e substitui a coleção de forma explícita', async () => {
    const backup = await createBackup(initialState(), { theme: 'system' }, [doc()]);
    const parsed = await parseBackup(JSON.stringify(backup));
    await restoreState(parsed.data, parsed.documents);
    expect(await (await listDocuments())[0].blob.text()).toContain('%PDF');
    await restoreState(initialState(), []);
    expect(await listDocuments()).toHaveLength(0);
  });
  it('rejeita estrutura, versão, IDs duplicados e arquivos adulterados', async () => {
    const backup = await createBackup(initialState(), { theme: 'light' }, [doc()]);
    await expect(parseBackup('{')).rejects.toThrow('Backup inválido');
    await expect(parseBackup(JSON.stringify({ ...backup, version: 2 }))).rejects.toThrow(
      'Backup inválido',
    );
    await expect(
      parseBackup(
        JSON.stringify({ ...backup, documents: [...backup.documents!, ...backup.documents!] }),
      ),
    ).rejects.toThrow('duplicados');
    await expect(
      parseBackup(
        JSON.stringify({ ...backup, documents: [{ ...backup.documents![0], size: 999 }] }),
      ),
    ).rejects.toThrow('Tamanho');
    await expect(
      parseBackup(
        JSON.stringify({
          ...backup,
          data: { ...backup.data, days: Array(4).fill(backup.data.days[0]) },
        }),
      ),
    ).rejects.toThrow('Backup inválido');
    expect((await loadState()).activities).toHaveLength(0);
  });
  it('não sobrescreve estado válido se a nova estrutura falha', async () => {
    const s = initialState();
    s.budget = 50;
    await saveState(s);
    await expect(saveState({ ...s, budget: -1 })).rejects.toThrow();
    expect((await loadState()).budget).toBe(50);
  });
});
