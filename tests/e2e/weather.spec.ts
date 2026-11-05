import { test, expect } from '@playwright/test';
import { weatherFixture } from '../weather-fixture';

test('relógio e previsão usam Atenas, persistem offline e não repetem consultas ao navegar', async ({
  page,
  context,
}) => {
  let requests = 0;
  await page.route('https://api.open-meteo.com/**', (route) => {
    requests++;
    return route.fulfill({ json: weatherFixture() });
  });
  await page.goto('./');
  const button = page.getByRole('button', { name: 'Ver previsão do tempo de Atenas', exact: true });
  await expect(button).toContainText('18 °C');
  const validTimes = await page.evaluate(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Athens',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    return [Date.now(), Date.now() - 30_000].map((instant) => format.format(new Date(instant)));
  });
  expect(validTimes).toContain(
    await page.locator('.mobile-conditions .athens-time strong').innerText(),
  );
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Tempo em Atenas' });
  await expect(dialog.locator('.weather-days article')).toHaveCount(4);
  await expect(dialog).toContainText('12 °C');
  await expect(dialog).toContainText('21 °C');
  await expect(dialog).toContainText('75% de chance de chuva');
  await expect(dialog).toContainText('Open-Meteo');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/tempo-atenas.png', scale: 'css' });
  await page.getByRole('button', { name: 'Fechar janela' }).click();
  for (const section of ['roteiro', 'gastos', 'mapa']) {
    await page.goto(`./#${section}`);
    await expect(button).toContainText('18 °C');
  }
  expect(requests).toBe(1);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(button).toContainText('18 °C');
  await expect(button).toContainText('Salvo');
  await button.click();
  await expect(dialog).toContainText('Sem conexão.');
  expect(requests).toBe(1);
});

test('falha da previsão não impede o app e não mostra temperatura inventada', async ({ page }) => {
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 503, body: '' }),
  );
  await page.goto('./');
  const button = page.getByRole('button', { name: 'Ver previsão do tempo de Atenas' });
  await expect(button).toContainText('Tempo indisponível');
  await expect(button).toContainText('— °C');
  await button.click();
  await expect(page.getByRole('dialog')).toContainText('Não foi possível consultar');
  await page.getByRole('button', { name: 'Fechar janela' }).click();
  await page.getByRole('button', { name: 'Ver roteiro', exact: true }).click();
  await expect(page.locator('.activity')).toHaveCount(19);
});
