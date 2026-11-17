import { expect, test } from '@playwright/test';

test('identifica documentos relacionados e permite escolher um PDF', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'showDirectoryPicker', { value: undefined, configurable: true }));
  await page.goto('./#roteiro/2026-11-21/plan-2-05');
  const documents = page.getByRole('region', { name: 'Documentos desta atividade' });
  const input = page.getByLabel('Selecionar Ingresso do museu');
  await input.setInputFiles({ name: 'outro.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') });
  await expect(documents.getByRole('status')).toContainText('não corresponde');
  await input.setInputFiles({ name: 'Kotsanas-exemplo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') });
  await expect(documents.getByRole('link', { name: 'Abrir PDF selecionado' })).toHaveAttribute('href', /^blob:/);
});

test('usa a pasta autorizada para abrir o PDF relacionado', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: async () => {
      const root = await navigator.storage.getDirectory();
      const trip = await root.getDirectoryHandle('Viagem', { create: true });
      const athens = await trip.getDirectoryHandle('Atenas', { create: true });
      const file = await athens.getFileHandle('agora-antiga-exemplo.pdf', { create: true });
      const writer = await file.createWritable();
      await writer.write('%PDF-1.4\n% Agora\n%%EOF');
      await writer.close();
      return trip;
    }});
    Object.defineProperty(window, 'open', { configurable: true, value: () => {
      const tab = { closed: false, location: { async replace(url: string) { document.documentElement.dataset.openedPdf = await (await fetch(url)).text(); tab.closed = true; } }, close() { tab.closed = true; } };
      return tab;
    }});
  });
  await page.goto('./#roteiro/2026-11-22/plan-3-03');
  await page.getByRole('button', { name: 'Escolher pasta Viagem' }).click();
  await page.getByRole('button', { name: 'Abrir Atenas/agora-antiga-exemplo.pdf' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-opened-pdf', /Agora/);
});
