import { test, expect } from '@playwright/test';

test('cards do mapa mostram fotos, rotas, detalhes e navegação para a atividade offline', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./#mapa');
  const search = page.getByRole('searchbox', { name: 'Buscar destinos do roteiro' });
  await search.fill('BIBLIOTECA');
  const card = page.getByRole('article', { name: 'Biblioteca de Adriano', exact: true });
  await expect(
    card.getByRole('heading', { name: 'Biblioteca de Adriano', exact: true }),
  ).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() => card.getByRole('img').evaluate((img: HTMLImageElement) => img.naturalWidth > 0))
    .toBe(true);
  await expect(card.locator('.destination-schedule')).toContainText('09:00–09:35');
  await expect(card.locator('.destination-opening')).toContainText('08h–15h');
  await expect(
    card.getByRole('link', { name: 'Abrir Biblioteca de Adriano no Google Maps' }),
  ).toHaveAttribute('href', /google\.com\/maps\/search\/\?api=1&query=/);
  await expect(card.getByRole('link', { name: 'A pé', exact: true })).toHaveAttribute(
    'href',
    /travelmode=walking/,
  );
  await expect(card.getByRole('link', { name: 'Transporte público', exact: true })).toHaveAttribute(
    'href',
    /travelmode=transit/,
  );
  const walk = page.getByRole('article', { name: 'Hotel → Biblioteca de Adriano', exact: true });
  await expect(walk.locator('.transport-detail')).not.toBeVisible();
  await walk.locator('summary').click();
  await expect(walk.locator('.transport-detail')).toContainText('Adam’s Hotel, Plaka');
  await expect(walk.locator('.destination-transport-chip')).toContainText('20 min');
  await expect(walk.getByRole('link', { name: 'A pé', exact: true })).toHaveAttribute(
    'href',
    /origin=Adam/,
  );
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/mapa-cards-claro.png', scale: 'css' });
  await page.getByRole('button', { name: 'Alternar tema claro ou escuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/mapa-cards-escuro.png', scale: 'css' });
  await card
    .getByRole('link', { name: 'Ver atividade: Biblioteca de Adriano', exact: true })
    .click();
  await expect(page).toHaveURL(/#roteiro\/2026-11-21\/plan-2-03$/);
  await expect(page.getByRole('heading', { name: 'Detalhes', exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('./#mapa');
  await search.fill('BIBLIOTECA');
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() => card.getByRole('img').evaluate((img: HTMLImageElement) => img.naturalWidth > 0))
    .toBe(true);
  await expect(page.getByText('Você está offline.', { exact: false })).toBeVisible();
  await search.fill('nao-existe-xyz');
  await expect(page.getByRole('heading', { name: 'Nenhum destino encontrado' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Hospedagem no mapa' })).toBeVisible();
  expect(errors).toEqual([]);
});
