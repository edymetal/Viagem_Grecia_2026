import { test, expect } from '@playwright/test';
import { emptyState } from '../../src/data/factories';

test('o cronograma de Atenas e Roma fica acessível offline', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#roteiro/2026-11-20');
  await expect(page.getByRole('tab')).toHaveCount(7);
  await page.getByRole('link', { name: 'Ver detalhes: Voo ITA AZ718 · Roma → Atenas' }).click();
  await expect(page.locator('.visit-facts')).toContainText('15:35 (Itália) – 18:35 (Atenas)');
  await page.getByRole('link', { name: 'Voltar ao roteiro' }).click();
  await page.getByRole('tab', { name: /21\/11/ }).click();
  const tour = page.getByRole('link', { name: /Ver detalhes: Tour da Acrópole/ });
  await expect(tour).toContainText('Confirmada');
  await expect(tour).toContainText('09:30');
  await page.getByRole('tab', { name: /22\/11/ }).click();
  await expect(
    page.getByRole('link', { name: 'Ver detalhes: Biblioteca de Adriano' }),
  ).toContainText('09:05');
  await page.getByRole('tab', { name: /24\/11/ }).click();
  const vicus = page.getByRole('link', { name: /Ver detalhes: Vicus Caprarius/ });
  await expect(vicus).toContainText('Confirmada');
  await vicus.click();
  await expect(page.getByText(/entre 15h20 e 15h30/)).toBeVisible();
  await page.goto('./#gastos');
  await expect(page.locator('.trip-total-value')).toContainText('969,59');
  await expect(page.locator('.planned-range:not(.projected-range)')).toContainText('359,70');
  await expect(page.locator('.planned-range:not(.projected-range)')).toContainText('497,70');
  await expect(page.locator('.projected-range')).toContainText('1.329,29');
  await expect(page.locator('.projected-range')).toContainText('1.467,29');
  await expect(page.locator('.balance strong')).toHaveText('—');
  await page.goto('./#hotel');
  await expect(page.getByRole('heading', { name: 'Ilissos Hotel', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ciao Termini', exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('./#roteiro/2026-11-25');
  await expect(
    page.getByRole('link', { name: /Ver detalhes: Planetário · Ritorno/ }),
  ).toContainText('16:00');
  await expect(
    page.getByRole('link', { name: /Ver detalhes: Planetário · Interstellari/ }),
  ).toContainText('17:00');
  await page.getByRole('tab', { name: /26\/11/ }).click();
  await expect(page.getByRole('link', { name: /Ver detalhes: Voo Ryanair/ })).toContainText(
    '13:50',
  );
  await page.goto('./#mapa');
  await expect(page.getByRole('heading', { name: 'Galleria Borghese', exact: true })).toBeVisible();
  await page.goto('./#inicio');
  await expect(
    page.getByRole('img', { name: 'Vista da Acrópole e do Partenon em Atenas' }),
  ).toBeVisible();
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
  await expect(page.getByLabel('Adicionar as despesas informadas')).not.toBeChecked();
  await page.getByRole('button', { name: 'Incorporar planejamento', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Incorporar cronograma', exact: true }),
  ).toHaveCount(0);
  await page.goto('./#roteiro');
  await expect(page.locator('.activity')).toHaveCount(12);
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
