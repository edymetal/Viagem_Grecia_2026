import { expect, test, type Page } from '@playwright/test';

async function captureOpenedPdf(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'open', {
      configurable: true,
      value: () => {
        const tab = {
          closed: false,
          location: {
            async replace(url: string) {
              document.documentElement.dataset.openedPdf = await (await fetch(url)).text();
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
}

test('identifica documentos relacionados e permite escolher um PDF', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'showDirectoryPicker', { value: undefined, configurable: true }),
  );
  await page.goto('./#roteiro/2026-11-21/plan-2-05');
  const documents = page.getByRole('region', { name: 'Documentos desta atividade' });
  const input = page.getByLabel('Selecionar Ingresso do museu');
  await input.setInputFiles({
    name: 'outro.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n%%EOF'),
  });
  await expect(documents.getByRole('status')).toContainText('não corresponde');
  await input.setInputFiles({
    name: 'Kotsanas-exemplo.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n%%EOF'),
  });
  await expect(documents.getByRole('link', { name: 'Abrir PDF selecionado' })).toHaveAttribute(
    'href',
    /^blob:/,
  );
});

test('abre os PDFs salvos no app pelo roteiro offline sem pedir acesso à pasta', async ({
  page,
  context,
}) => {
  await captureOpenedPdf(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'showDirectoryPicker', {
      configurable: true,
      value: () => {
        throw new Error('Os arquivos salvos não precisam de acesso à pasta');
      },
    });
  });
  await page.goto('./#documentos');
  await page.getByRole('button', { name: 'Adicionar arquivo' }).click();
  const importer = page.getByRole('dialog', { name: 'Adicionar documentos' });
  await importer.getByLabel(/PDF ou imagem/).setInputFiles([
    {
      name: 'Kotsanas-ingresso.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n% ingresso salvo no app\n%%EOF'),
    },
    {
      name: 'Kotsanas-pagamento.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n% pagamento salvo no app\n%%EOF'),
    },
  ]);
  await importer.getByRole('button', { name: 'Guardar neste dispositivo' }).click();
  await expect(page.getByRole('heading', { name: 'Arquivos salvos no app 2' })).toBeVisible();

  await page.goto('./#roteiro/2026-11-21/plan-2-05');
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();

  const documents = page.getByRole('region', { name: 'Documentos desta atividade' });
  await documents.getByRole('button', { name: 'Abrir ingresso do museu', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-opened-pdf', /ingresso salvo no app/);
  await documents.getByRole('button', { name: 'Abrir comprovante do museu', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-opened-pdf', /pagamento salvo no app/);
  await expect(documents.getByRole('button', { name: /pasta/i })).toHaveCount(0);
  await expect(documents.locator('input[type="file"]')).toHaveCount(0);
});

test('autoriza uma vez e abre PDFs de atividades diferentes após reabrir offline', async ({
  page,
  context,
}) => {
  await captureOpenedPdf(page);
  await page.addInitScript(() => {
    Object.defineProperty(FileSystemDirectoryHandle.prototype, 'queryPermission', {
      configurable: true,
      value: async () => (sessionStorage.getItem('permission-expired') ? 'prompt' : 'granted'),
    });
    Object.defineProperty(FileSystemDirectoryHandle.prototype, 'requestPermission', {
      configurable: true,
      value: async () => {
        throw new Error('O acesso não deveria pedir autorização novamente');
      },
    });
    Object.defineProperty(window, 'showDirectoryPicker', {
      configurable: true,
      value: async () => {
        const root = await navigator.storage.getDirectory();
        const trip = await root.getDirectoryHandle('Viagem', { create: true });
        const athens = await trip.getDirectoryHandle('Atenas', { create: true });
        for (const name of ['agora-antiga', 'kotsanas']) {
          const file = await athens.getFileHandle(`${name}-exemplo.pdf`, { create: true });
          const writer = await file.createWritable();
          await writer.write(`%PDF-1.4\n% ${name}\n%%EOF`);
          await writer.close();
        }
        return trip;
      },
    });
  });
  await page.goto('./#roteiro/2026-11-22/plan-3-03');
  await page.getByRole('button', { name: 'Escolher pasta Viagem' }).click();
  await page.getByRole('button', { name: 'Abrir ingresso da ágora' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-opened-pdf', /agora-antiga/);

  await page.goto('./#roteiro/2026-11-21/plan-2-05');
  await page.getByRole('button', { name: 'Abrir ingresso do museu' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-opened-pdf', /kotsanas/);

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    sessionStorage.setItem('permission-expired', 'true');
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Abrir ingresso do museu' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-opened-pdf', /kotsanas/);
  await expect(page.getByRole('button', { name: 'Autorizar acesso à pasta' })).toHaveCount(0);

  await page.goto('./#documentos');
  await page.getByRole('button', { name: 'Abrir Atenas/agora-antiga-exemplo.pdf' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-opened-pdf', /agora-antiga/);
});
