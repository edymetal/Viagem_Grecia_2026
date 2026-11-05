import { test, expect } from '@playwright/test';
import { emptyState } from '../../src/data/factories';

test('cronograma completo, pendências, fusos, mapa e valores ficam acessíveis offline', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#roteiro');
  await expect(page.locator('.activity')).toHaveCount(19);
  await expect(page.locator('.activity').first()).toContainText('Itália');
  await expect(page.getByText('Revise os horários', { exact: true })).toHaveCount(0);
  await page.getByRole('tab', { name: /21\/11/ }).click();
  await expect(page.locator('.activity')).toHaveCount(24);
  const acropolis = page.locator('.activity').filter({
    has: page.getByRole('heading', {
      name: 'Acrópole e Partenon com guia em português',
      exact: true,
    }),
  });
  await expect(acropolis).toContainText('Proposto');
  await acropolis.getByRole('link').click();
  await expect(page.getByRole('link', { name: 'Reservar somente guia' })).toHaveAttribute(
    'href',
    /getyourguide/,
  );
  await page.getByRole('link', { name: 'Voltar ao roteiro' }).click();
  await page.getByRole('tab', { name: /22\/11/ }).click();
  await expect(page.locator('.activity')).toHaveCount(27);
  await expect(page.locator('.planning-notice')).toContainText('última entrada informada às 16h30');
  await page.getByRole('tab', { name: /23\/11/ }).click();
  await expect(page.locator('.activity')).toHaveCount(19);
  await expect(page.locator('.activity').last()).toContainText('22:59');
  await expect(page.locator('.activity').last()).toContainText('Itália');
  await page.goto('./#gastos');
  await expect(page.locator('.planned-range')).toContainText('441,81');
  await expect(page.locator('.planned-range')).toContainText('481,81');
  await expect(page.locator('.expense')).toHaveCount(11);
  await expect(page.locator('.balance strong')).toHaveText('—');
  await page.goto('./#hotel');
  await expect(page.getByRole('heading', { name: 'Adam’s Hotel', exact: true })).toBeVisible();
  await expect(page.locator('.hotel-card')).toContainText('Ainda não reservado');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('./#roteiro');
  await page.getByRole('tab', { name: /22\/11/ }).click();
  await expect(page.locator('.activity')).toHaveCount(27);
  await page.goto('./#mapa');
  await expect(
    page.getByRole('heading', { name: 'Biblioteca de Adriano', exact: true }),
  ).toBeVisible();
  await page.goto('./#gastos');
  await expect(page.locator('.planned-range')).toContainText('481,81');
  await page.goto('./#inicio');
  await expect(
    page.getByRole('img', { name: 'Vista da Acrópole e do Partenon em Atenas' }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator('.hero-photo')
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  expect(errors).toEqual([]);
});

test('instalação anterior incorpora o cronograma uma vez sem perder notas, gastos e arquivos', async ({
  page,
}) => {
  await page.goto('./');
  const state = emptyState();
  state.budget = 700;
  state.days[0].notes = 'Anotação anterior';
  state.expenses.push({
    id: 'local-exp',
    title: 'Minha despesa anterior',
    amount: 5,
    date: '2026-11-05',
    category: 'Outros',
    status: 'Realizado',
    paid: true,
    notes: '',
  });
  await page.evaluate(async (s) => {
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.open('atenas-2026', 1);
      r.onerror = () => reject(r.error);
      r.onsuccess = () => {
        const db = r.result;
        const tx = db.transaction(['state', 'documents'], 'readwrite');
        tx.objectStore('state').put(s, 'current');
        const blob = new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' });
        tx.objectStore('documents').put({
          id: 'local-doc',
          name: 'arquivo-local.pdf',
          type: blob.type,
          category: 'Outros',
          size: blob.size,
          createdAt: new Date().toISOString(),
          blob,
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, state);
  await page.reload();
  await page.getByRole('button', { name: 'Incorporar cronograma', exact: true }).click();
  await expect(page.getByLabel('Adicionar as 11 despesas')).not.toBeChecked();
  await page.getByRole('button', { name: 'Incorporar planejamento', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Incorporar cronograma', exact: true }),
  ).toHaveCount(0);
  await page.goto('./#roteiro');
  await expect(page.locator('.activity')).toHaveCount(19);
  await expect(page.getByText('Anotação anterior', { exact: true })).toBeVisible();
  await page.goto('./#gastos');
  await expect(page.locator('.expense')).toHaveCount(1);
  await expect(page.locator('.balance strong')).toContainText('695,00');
  await page.goto('./#documentos');
  await expect(page.getByRole('heading', { name: 'arquivo-local.pdf' })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Incorporar cronograma', exact: true }),
  ).toHaveCount(0);
});

test('layout com cronograma preenchido não transborda em telas pequenas', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const screen of [
      'inicio',
      'roteiro',
      'mapa',
      'gastos',
      'hotel',
      'informacoes',
      'checklist',
    ]) {
      await page.goto(`./#${screen}`);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('./#roteiro');
  await page.screenshot({ path: 'test-results/cronograma-mobile.png', fullPage: false });
  await page.goto('./#gastos');
  await page.screenshot({ path: 'test-results/gastos-planejados-mobile.png', fullPage: false });
});
