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
  await expect(page.getByRole('heading', { name: 'Seus lugares em Atenas' })).toHaveCount(0);
  await expect(page.locator('.map-screen h2').first()).toHaveText('Pontos no mapa');
  await expect(page.locator('.trip-map-marker')).toHaveCount(10);
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
  await page.getByRole('searchbox', { name: 'Buscar destinos do roteiro' }).fill('biblioteca');
  await expect(page.locator('.trip-map-marker')).toHaveCount(1);
  await page.locator('.trip-map-marker[title="Biblioteca de Adriano"]').click();
  const preview = page.getByRole('dialog', { name: 'Ponto no mapa' });
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole('heading', { name: 'Biblioteca de Adriano', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      preview
        .locator('.destination-cover img')
        .evaluate((img: HTMLImageElement) => img.naturalWidth > 0),
    )
    .toBe(true);
  await expect(preview).toContainText('09:00–09:35');
  await expect(preview).toContainText('08h–15h');
  await expect(preview.getByRole('link', { name: 'A pé', exact: true })).toHaveAttribute(
    'href',
    /travelmode=walking/,
  );
  await expect(
    preview.getByRole('link', { name: 'Transporte público', exact: true }),
  ).toHaveAttribute('href', /travelmode=transit/);
  await expect(
    preview.getByRole('link', { name: /Abrir Biblioteca de Adriano no Google Maps/ }),
  ).toHaveAttribute('href', /google.com\/maps\/search/);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await preview.evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/ponto-mapa-claro.png', scale: 'css' });
  await page.keyboard.press('Escape');
  await expect(preview).not.toBeVisible();
  await expect(page.locator('.trip-map-marker')).toHaveCount(1);
  await page.getByRole('button', { name: 'Alternar tema claro ou escuro' }).click();
  await page.locator('.trip-map-marker[title="Biblioteca de Adriano"]').focus();
  await page.keyboard.press('Enter');
  await expect(preview).toBeVisible();
  await page.screenshot({ path: 'test-results/ponto-mapa-escuro.png', scale: 'css' });
  await preview
    .getByRole('link', { name: 'Ver atividade: Biblioteca de Adriano', exact: true })
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
