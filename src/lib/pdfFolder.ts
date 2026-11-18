import { openDB, type DBSchema } from 'idb';
import { verifyFile } from './backup';
import { MAX_LOCAL_DOCUMENT_BYTES, MAX_LOCAL_DOCUMENTS, documentMetaSchema } from '../data/schema';

type ReadPermission = { mode: 'read' };

export type PdfDirectory = FileSystemDirectoryHandle & {
  queryPermission?: (options: ReadPermission) => Promise<PermissionState>;
  requestPermission?: (options: ReadPermission) => Promise<PermissionState>;
};

type FolderPickerWindow = Window & {
  showDirectoryPicker?: (
    options: ReadPermission & {
      id: string;
      startIn: 'documents';
    },
  ) => Promise<PdfDirectory>;
};

type CachedPdf = { path: string; blob: Blob };
type LivePdf = { path: string; file: FileSystemFileHandle };
export type FolderPdf = { path: string; file?: FileSystemFileHandle; blob?: Blob };
type PdfCopies = { name: string; pdfs: CachedPdf[]; partial: boolean };

interface PdfFolderDB extends DBSchema {
  folders: { key: string; value: PdfDirectory };
  copies: { key: string; value: PdfCopies };
}

const folderDb = () =>
  openDB<PdfFolderDB>('atenas-pdf-folder', 2, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) database.createObjectStore('folders');
      database.createObjectStore('copies');
    },
  });

export async function loadPdfFolder() {
  const db = await folderDb();
  try {
    const tx = db.transaction(['folders', 'copies']);
    const [folder, copies] = await Promise.all([
      tx.objectStore('folders').get('viagem'),
      tx.objectStore('copies').get('viagem'),
      tx.done,
    ]);
    return { folder, copies };
  } finally {
    db.close();
  }
}

export async function rememberPdfFolder(folder: PdfDirectory, copies: PdfCopies) {
  const db = await folderDb();
  try {
    const tx = db.transaction(['folders', 'copies'], 'readwrite');
    try {
      await Promise.all([
        tx.objectStore('folders').put(folder, 'viagem'),
        tx.objectStore('copies').put(copies, 'viagem'),
        tx.done,
      ]);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'DataCloneError')) throw error;
      tx.abort();
      await tx.done.catch(() => undefined);
      // Some browsers cannot keep a directory handle. Still keep the offline PDFs.
      const fallback = db.transaction(['folders', 'copies'], 'readwrite');
      await Promise.all([
        fallback.objectStore('folders').delete('viagem'),
        fallback.objectStore('copies').put(copies, 'viagem'),
        fallback.done,
      ]);
    }
  } finally {
    db.close();
  }
}

export function canPickPdfFolder() {
  return typeof (window as FolderPickerWindow).showDirectoryPicker === 'function';
}

export function pickPdfFolder() {
  return (window as FolderPickerWindow).showDirectoryPicker!({
    id: 'viagem-pdfs',
    startIn: 'documents',
    mode: 'read',
  });
}

export async function listFolderPdfs(folder: PdfDirectory) {
  const pdfs: LivePdf[] = [];
  const directories = [{ handle: folder, path: '' }];
  while (directories.length) {
    const { handle, path } = directories.pop()!;
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        directories.push({
          handle: entry as FileSystemDirectoryHandle,
          path: `${path}${entry.name}/`,
        });
      } else if (/\.pdf$/i.test(entry.name)) {
        pdfs.push({ file: entry as FileSystemFileHandle, path: path + entry.name });
      }
    }
  }
  return pdfs.sort((a, b) => a.path.localeCompare(b.path, 'pt-BR', { numeric: true }));
}

export async function copyFolderPdfs(name: string, files: LivePdf[]): Promise<PdfCopies> {
  const pdfs: CachedPdf[] = [];
  let bytes = 0;
  for (const { path, file } of files) {
    if (pdfs.length >= MAX_LOCAL_DOCUMENTS) break;
    try {
      const original = await file.getFile();
      if (
        !documentMetaSchema.shape.size.safeParse(original.size).success ||
        bytes + original.size > MAX_LOCAL_DOCUMENT_BYTES
      )
        continue;
      await verifyFile(original, 'application/pdf');
      // Read the bytes so the copy survives revocation of the original file handle.
      const blob = new Blob([await original.arrayBuffer()], { type: 'application/pdf' });
      pdfs.push({ path, blob });
      bytes += blob.size;
    } catch {
      // A file that could not be read can still be retried directly from the folder.
    }
  }
  return { name, pdfs, partial: pdfs.length < files.length };
}

async function readFolderPdf(pdf: FolderPdf) {
  try {
    if (pdf.file) {
      const original = await pdf.file.getFile();
      await verifyFile(original, 'application/pdf');
      return original.slice(0, original.size, 'application/pdf');
    }
  } catch (error) {
    if (!pdf.blob) throw error;
  }
  if (pdf.blob) return pdf.blob;
  throw new Error('PDF indisponível.');
}

export async function openFolderPdf(pdf: FolderPdf) {
  // Open the tab during the click, before the asynchronous read from the device.
  const tab = window.open('', '_blank');
  try {
    if (tab) tab.opener = null;
    const file = await readFolderPdf(pdf);
    if (tab?.closed) return;

    const url = URL.createObjectURL(file);
    try {
      if (tab) tab.location.replace(url);
      else window.location.assign(url);
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
    if (tab) {
      const timer = window.setInterval(() => {
        if (!tab.closed) return;
        clearInterval(timer);
        URL.revokeObjectURL(url);
      }, 2000);
    }
  } catch (error) {
    tab?.close();
    throw error;
  }
}
