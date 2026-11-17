import { expect, test } from '@playwright/test';

test('lembra a pasta e abre o PDF original com um toque', async ({ page, context }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'showDirectoryPicker', {
      configurable: true,
      value: async (options: { mode: string }) => {
        if (options.mode !== 'read') throw new Error('Expected read-only permission');
        const root = await navigator.storage.getDirectory();
        const trip = await root.getDirectoryHandle('Viagem', { create: true });
        const athens = await trip.getDirectoryHandle('Atenas', { create: true });
        const pdf = await athens.getFileHandle('Ingresso.pdf', { create: true });
        const writer = await pdf.createWritable();
        await writer.write('%PDF-1.4\n% Ingresso original\n%%EOF');
        await writer.close();
        await athens.getFileHandle('Notas.txt', { create: true });
        return trip;
      },
    });
    Object.defineProperty(window, 'open', {
      configurable: true,
      value: () => {
        const tab = {
          closed: false,
          location: {
            async replace(url: string) {
              const response = await fetch(url);
              document.documentElement.dataset.openedPdf = await response.text();
              tab.closed = true;
            },
          },
          close() {
            tab.closed = true;
          },
        };
        return tab;
      },
    });
  });

  await page.goto('./#documentos');
  await page.getByRole('button', { name: 'Escolher pasta Viagem' }).click();
  const ticket = page.getByRole('button', { name: 'Abrir Atenas/Ingresso.pdf' });
  await expect(ticket).toBeEnabled();
  await expect(page.getByText('Notas.txt')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Arquivos salvos no app 0' })).toBeVisible();

  await page.reload();
  await expect(ticket).toBeEnabled();
  await page.evaluate(async () => {
    const root = await navigator.storage.getDirectory();
    const trip = await root.getDirectoryHandle('Viagem');
    const athens = await trip.getDirectoryHandle('Atenas');
    const file = await athens.getFileHandle('Ingresso.pdf');
    const writer = await file.createWritable();
    await writer.write('%PDF-1.4\n% Ingresso atualizado\n%%EOF');
    await writer.close();
  });
  await context.setOffline(true);
  await ticket.click();
  await expect(page.locator('html')).toHaveAttribute('data-opened-pdf', /Ingresso atualizado/);
});
