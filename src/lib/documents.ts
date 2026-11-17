import {
  documentMetaSchema,
  MAX_LOCAL_DOCUMENT_BYTES,
  MAX_LOCAL_DOCUMENTS,
  type LocalDocument,
} from '../data/schema';
import { verifyFile } from './backup';

const fileTypes: Record<string, LocalDocument['type']> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

async function importId(name: string, bytes: Uint8Array<ArrayBuffer>) {
  const filename = new TextEncoder().encode(name);
  const input = new Uint8Array(filename.length + 1 + bytes.length);
  input.set(filename);
  input.set(bytes, filename.length + 1);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', input));
  return 'doc-' + Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function prepareLocalDocuments(
  files: File[],
  category: string,
  existing: LocalDocument[],
) {
  if (!files.length) throw new Error('Selecione pelo menos um arquivo.');
  if (files.length > MAX_LOCAL_DOCUMENTS) throw new Error('Selecione até 100 arquivos por vez.');

  const documents = new Map<string, LocalDocument>();
  let addedBytes = 0;
  const createdAt = new Date().toISOString();
  for (const file of files) {
    const declaredType = documentMetaSchema.shape.type.safeParse(file.type);
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const type = declaredType.success ? declaredType.data : fileTypes[extension];
    const meta = documentMetaSchema.safeParse({
      id: 'import',
      name: file.name,
      category,
      type,
      size: file.size,
      createdAt,
    });
    if (!meta.success)
      throw new Error(`${file.name}: selecione um PDF ou uma imagem válida de até 10 MB.`);
    try {
      await verifyFile(file, meta.data.type);
    } catch {
      throw new Error(`${file.name}: o conteúdo do arquivo não corresponde ao formato indicado.`);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const id = await importId(file.name, bytes);
    if (documents.has(id)) continue;
    let saved = existing.find((doc) => doc.id === id);
    // Earlier imports used random IDs. Preserve their links and categories on a reimport.
    if (!saved) {
      for (const doc of existing) {
        if (doc.name !== file.name || doc.size !== file.size || doc.type !== meta.data.type)
          continue;
        const original = new Uint8Array(await doc.blob.arrayBuffer());
        if (
          original.length === bytes.length &&
          original.every((byte, index) => byte === bytes[index])
        ) {
          saved = doc;
          break;
        }
      }
    }
    if (saved) {
      documents.set(id, saved);
      continue;
    }

    addedBytes += file.size;
    if (addedBytes > MAX_LOCAL_DOCUMENT_BYTES)
      throw new Error('Selecione arquivos que somem até 50 MB.');
    documents.set(id, { ...meta.data, id, blob: new Blob([bytes], { type: meta.data.type }) });
  }

  return [...documents.values()];
}
