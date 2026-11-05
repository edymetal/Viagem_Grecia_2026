import {
  backupSchema,
  preferencesSchema,
  type AppState,
  type Backup,
  type LocalDocument,
  type Preferences,
} from '../data/schema';

export function readPreferences(): Preferences {
  try {
    return preferencesSchema.parse(
      JSON.parse(localStorage.getItem('atenas-preferences') || '{"theme":"system"}'),
    );
  } catch {
    return { theme: 'system' };
  }
}
export async function createBackup(
  data: AppState,
  preferences: Preferences,
  documents?: LocalDocument[],
): Promise<Backup> {
  return backupSchema.parse({
    format: 'atenas-2026-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
    preferences,
    ...(documents
      ? {
          documents: await Promise.all(
            documents.map(async ({ blob, ...meta }) => {
              const bytes = new Uint8Array(await blob.arrayBuffer());
              let binary = '';
              for (let i = 0; i < bytes.length; i += 8192)
                binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
              return { ...meta, base64: btoa(binary) };
            }),
          ),
        }
      : {}),
  });
}
export async function verifyFile(blob: Blob, type: string) {
  const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  const is = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  const valid =
    type === 'application/pdf'
      ? is(37, 80, 68, 70, 45)
      : type === 'image/png'
        ? is(137, 80, 78, 71, 13, 10, 26, 10)
        : type === 'image/jpeg'
          ? is(255, 216, 255)
          : type === 'image/webp' &&
            is(82, 73, 70, 70) &&
            String.fromCharCode(...head.slice(8, 12)) === 'WEBP';
  if (!valid)
    throw new Error('O conteúdo do arquivo não corresponde a um PDF ou imagem compatível.');
}
export async function parseBackup(content: string) {
  if (content.length > 80 * 1024 * 1024) throw new Error('O backup excede 80 MB.');
  let backup: Backup;
  try {
    backup = backupSchema.parse(JSON.parse(content));
  } catch {
    throw new Error('Backup inválido ou versão não compatível. Nenhum dado foi alterado.');
  }
  let total = 0;
  const documents = backup.documents
    ? await Promise.all(
        backup.documents.map(async ({ base64, ...meta }) => {
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || base64.length % 4 !== 0)
            throw new Error('Documento com codificação inválida.');
          const binary = atob(base64);
          total += binary.length;
          if (binary.length !== meta.size || total > 50 * 1024 * 1024)
            throw new Error('Tamanho dos documentos inválido ou maior que 50 MB.');
          const blob = new Blob([Uint8Array.from(binary, (c) => c.charCodeAt(0))], {
            type: meta.type,
          });
          await verifyFile(blob, meta.type);
          return { ...meta, blob };
        }),
      )
    : undefined;
  if (documents && new Set(documents.map((d) => d.id)).size !== documents.length)
    throw new Error('Há documentos duplicados no backup.');
  if (documents) {
    const ids = new Set(documents.map((d) => d.id));
    if (
      backup.data.activities.some((a) => a.photoDocumentId && !ids.has(a.photoDocumentId)) ||
      backup.data.reservations.some((r) => r.documentId && !ids.has(r.documentId))
    )
      throw new Error('O backup contém referências a documentos ausentes.');
  }
  return { ...backup, documents };
}
export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
