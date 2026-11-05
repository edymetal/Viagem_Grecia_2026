import { test, expect } from '@playwright/test';
import { emptyState } from '../../src/data/factories';
import { ITINERARY_REVISION } from '../../src/data/itinerary';

test('resumo financeiro distingue previsões, abre categorias e persiste lançamentos offline', async ({
  page,
  context,
}) => {
  await page.goto('./#gastos');
  const state = { ...emptyState(), itineraryRevision: ITINERARY_REVISION };
  state.budget = 500;
  state.expenses = [
    {
      id: 'hotel',
      title: 'Hospedagem de teste',
      category: 'Hotel',
      amount: 200,
      status: 'Realizado',
    },
    {
      id: 'food',
      title: 'Alimentação de teste',
      category: 'Alimentação',
      amount: 85,
      status: 'Realizado',
    },
    {
      id: 'ticket',
      title: 'Ingressos de teste',
      category: 'Ingressos',
      amount: 60,
      status: 'Realizado',
    },
    {
      id: 'transport',
      title: 'Transporte de teste',
      category: 'Transporte',
      amount: 40,
      status: 'Realizado',
    },
    { id: 'other', title: 'Outros de teste', category: 'Outros', amount: 35, status: 'Realizado' },
    {
      id: 'planned',
      title: 'Previsão de teste',
      category: 'Hotel',
      amount: 800,
      status: 'Previsto',
    },
  ].map((e) => ({ ...e, date: '2026-11-20', paid: false, notes: '' })) as typeof state.expenses;
  await page.evaluate(async (state) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('atenas-2026', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('state', 'readwrite');
        tx.objectStore('state').put(state, 'current');
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, state);
  await page.reload();
  await expect(page.locator('.trip-total-value')).toContainText('420,00');
  await expect(page.getByRole('progressbar', { name: 'Orçamento consumido' })).toHaveAttribute(
    'value',
    '84',
  );
  await expect(page.locator('.budget-caption')).toContainText('84%');
  await expect(
    page.getByRole('button', { name: 'Ver lançamentos de Hotel', exact: true }),
  ).toContainText('200,00');
  await expect(page.locator('.balance strong')).toContainText('80,00');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  const cacheNotice = page.getByRole('button', { name: 'Dispensar aviso de cache' });
  if (await cacheNotice.isVisible()) await cacheNotice.click();
  await page.screenshot({ path: 'test-results/gastos-resumo.png', scale: 'css' });
  await page.getByRole('button', { name: 'Previstos', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Ver lançamentos de Hotel', exact: true }),
  ).toContainText('800,00');
  await expect(page.locator('.trip-total-value')).toContainText('420,00');
  await page.getByRole('button', { name: 'Ver lançamentos de Hotel', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Lançamentos', selected: true })).toBeVisible();
  await expect(page.locator('.expense')).toHaveCount(2);
  await page.getByRole('button', { name: 'Editar Hospedagem de teste', exact: true }).click();
  await page.getByLabel('Valor (€) *', { exact: true }).fill('210');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page
    .getByRole('button', { name: 'Marcar como paga: Hospedagem de teste', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Marcar como não paga: Hospedagem de teste' }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/gastos-lancamentos.png', scale: 'css' });
  await page.getByRole('tab', { name: 'Resumo', exact: true }).click();
  await expect(page.locator('.trip-total-value')).toContainText('430,00');
  await page.getByRole('button', { name: 'Definir orçamento', exact: true }).click();
  await page.getByLabel('Orçamento total em euros').fill('0');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.locator('.budget-alert')).toContainText('430,00');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '100');
  await page.getByRole('button', { name: 'Definir orçamento', exact: true }).click();
  await page.getByLabel('Orçamento total em euros').fill('');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.locator('.budget-caption')).toContainText('a definir');
  await expect(page.locator('.budget-caption')).toContainText('—');
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.trip-total-value')).toContainText('430,00');
  await page.getByRole('tab', { name: 'Lançamentos', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Marcar como não paga: Hospedagem de teste' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Excluir Outros de teste', exact: true }).click();
  await page.getByRole('button', { name: 'Excluir despesa', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('tab', { name: 'Resumo', exact: true }).click();
  await expect(page.locator('.trip-total-value')).toContainText('395,00');
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const name of ['Lançamentos', 'Resumo']) {
      await page.getByRole('tab', { name, exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.goto('./#preferencias');
  await page.getByRole('button', { name: 'Alternar tema claro ou escuro' }).click();
  await page.goto('./#gastos');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/gastos-escuro.png', scale: 'css' });
});
