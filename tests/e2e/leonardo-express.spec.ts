import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

test('mostra a caminhada e as opções de compra do Leonardo Express offline', async ({
  context,
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./');
  await expect(page.locator('.mobile-app-name .app-version')).toHaveText(`Versão ${version}`);
  const walkPath = './#roteiro/2026-11-23/nov-23-fiumicino-walk';
  await page.goto(walkPath);
  const walkMap = page.getByRole('link', { name: 'Traçar caminhada' });
  await expect(walkMap).toHaveAttribute('href', /travelmode=walking.*origin=Terminal\+1\+Arrivi/);
  await expect(page.getByRole('link', { name: 'Mapa oficial da caminhada' })).toHaveAttribute(
    'href',
    /adr\.it/,
  );
  await page.getByRole('link', { name: 'Como comprar o bilhete' }).click();
  const guide = page.getByRole('region', { name: /Leonardo Express.*Como comprar na máquina/ });
  await expect(guide.getByRole('link', { name: 'Abrir estação no mapa' })).toHaveAttribute(
    'href',
    /Fiumicino\+Aeroporto/,
  );
  await expect(guide.locator('blockquote[lang="it"]')).toContainText('per Roma Termini');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.goto(walkPath);
  await page.reload();
  await expect(walkMap).toBeVisible();
  await expect(page.getByText(/saída 5 do Terminal 1/)).toBeVisible();
  await page.goto('./#roteiro/2026-11-26/nov-26-platform');
  await page.reload();

  await expect(guide.locator('blockquote[lang="it"]')).toContainText('per Fiumicino Aeroporto');
  await expect(guide).toContainText('Ordinaria');
  await expect(guide).toContainText('€ 14');
  await expect(guide).toContainText('23 e 24');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
