import { openDB, type DBSchema } from 'idb';
import { verifyFile } from './backup';

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

export type FolderPdf = { path: string; file: FileSystemFileHandle };

interface PdfFolderDB extends DBSchema {
  folders: { key: string; value: PdfDirectory };
}

const folderDb = () =>
  openDB<PdfFolderDB>('atenas-pdf-folder', 1, {
    upgrade(database) {
      database.createObjectStore('folders');
    },
  });

export async function loadPdfFolder() {
  const db = await folderDb();
  try {
    return await db.get('folders', 'viagem');
  } finally {
    db.close();
  }
}

export async function rememberPdfFolder(folder: PdfDirectory) {
  const db = await folderDb();
  try {
    await db.put('folders', folder, 'viagem');
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
  const pdfs: FolderPdf[] = [];
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

export async function openFolderPdf(pdf: FolderPdf) {
  // Open the tab during the click, before the asynchronous read from the device.
  const tab = window.open('', '_blank');
  try {
    if (tab) tab.opener = null;
    const file = await pdf.file.getFile();
    await verifyFile(file, 'application/pdf');
    if (tab?.closed) return;

    const url = URL.createObjectURL(file.slice(0, file.size, 'application/pdf'));
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
