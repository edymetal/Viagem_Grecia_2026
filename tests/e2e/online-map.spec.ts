import { test, expect } from '@playwright/test';

test('mapa online mostra pontos, filtra a busca e volta aos cards offline', async ({
  page,
  context,
}) => {
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY1cAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await page.goto('./#mapa');
  await expect(page.locator('.trip-map-marker')).toHaveCount(10);
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
  await page.getByRole('searchbox', { name: 'Buscar destinos do roteiro' }).fill('biblioteca');
  await expect(page.locator('.trip-map-marker')).toHaveCount(1);
  await page.locator('.trip-map-marker[title="Biblioteca de Adriano"]').click();
  await expect(page.locator('.leaflet-popup-content')).toContainText('Biblioteca de Adriano');
  await page
    .locator('.leaflet-popup-content')
    .getByRole('link', { name: 'Ver atividade', exact: true })
    .click();
  await expect(page).toHaveURL(/#roteiro\/2026-11-21\/plan-2-03$/);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('./#mapa');
  await expect(page.getByText('Mapa indisponível offline.', { exact: false })).toBeVisible();
  await expect(page.locator('.online-trip-map')).toHaveCount(0);
  await expect(
    page.getByRole('article', { name: 'Biblioteca de Adriano', exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await expect(page.locator('.trip-map-marker')).toHaveCount(10);
});

test('falha nos tiles mantém pontos e cards acessíveis', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
  await page.goto('./#mapa');
  await expect(
    page.getByText('O fundo do mapa não pôde ser carregado.', { exact: false }),
  ).toBeVisible();
  await expect(page.locator('.trip-map-marker')).toHaveCount(10);
  await expect(
    page.getByRole('article', { name: 'Biblioteca de Adriano', exact: true }),
  ).toBeVisible();
});
