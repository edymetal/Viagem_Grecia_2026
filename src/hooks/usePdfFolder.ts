import { useEffect, useSyncExternalStore } from 'react';
import {
  canPickPdfFolder,
  copyFolderPdfs,
  listFolderPdfs,
  loadPdfFolder,
  pickPdfFolder,
  rememberPdfFolder,
  type FolderPdf,
  type PdfDirectory,
} from '../lib/pdfFolder';

type FolderState = {
  folder?: PdfDirectory;
  name?: string;
  pdfs: FolderPdf[];
  ready: boolean;
  loading: boolean;
  message: string;
};

let state: FolderState = { pdfs: [], ready: false, loading: true, message: '' };
let initialized = false;
const listeners = new Set<() => void>();
const snapshot = () => state;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function update(fields: Partial<FolderState>) {
  state = { ...state, ...fields };
  for (const listener of listeners) listener();
}

async function saveFolder(folder: PdfDirectory, files: Awaited<ReturnType<typeof listFolderPdfs>>) {
  const copies = await copyFolderPdfs(folder.name, files);
  const blobs = new Map(copies.pdfs.map(({ path, blob }) => [path, blob]));
  let message = copies.partial ? 'Alguns PDFs só estão disponíveis pela pasta original.' : '';
  try {
    await rememberPdfFolder(folder, copies);
  } catch {
    message = 'O navegador não conseguiu guardar as cópias offline. Confira o armazenamento.';
  }
  update({
    folder,
    name: folder.name,
    pdfs: files.map((file) => ({ ...file, blob: blobs.get(file.path) })),
    ready: true,
    message,
  });
}

async function initialize() {
  try {
    const { folder, copies } = await loadPdfFolder();
    update({ folder, name: copies?.name ?? folder?.name });
    if (copies) {
      update({
        ready: true,
        pdfs: copies.pdfs,
        message: copies.partial ? 'Alguns PDFs só estão disponíveis pela pasta original.' : '',
      });
    }
    if (!folder || !canPickPdfFolder()) return;
    const permission = await folder.queryPermission?.({ mode: 'read' });
    if (permission && permission !== 'granted') return;
    const files = await listFolderPdfs(folder);
    await saveFolder(folder, files);
  } catch {
    if (!state.ready) update({ message: 'Escolha a pasta Viagem para acessar seus PDFs.' });
  } finally {
    update({ loading: false });
  }
}

export async function connectPdfFolder(reuseFolder = true) {
  if (state.loading) return;
  update({ loading: true, message: '' });
  try {
    let folder = reuseFolder ? state.folder : undefined;
    if (folder?.requestPermission) {
      if ((await folder.requestPermission({ mode: 'read' })) !== 'granted') {
        update({ message: 'Permita a leitura da pasta para carregar os PDFs.' });
        return;
      }
    } else {
      folder = await pickPdfFolder();
    }
    await saveFolder(folder, await listFolderPdfs(folder));
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError'))
      update({ message: 'Não foi possível ler a pasta. Confira a permissão ou selecione Viagem.' });
  } finally {
    update({ loading: false });
  }
}

export function usePdfFolder() {
  const folderState = useSyncExternalStore(subscribe, snapshot);
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    void initialize();
  }, []);
  return folderState;
}
