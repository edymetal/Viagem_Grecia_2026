import { expect, test } from '@playwright/test';

test('mostra a reserva do Ilissos em grego e inglês e guarda os dados pessoais offline', async ({
  page,
  context,
}) => {
  const checkIn = './#roteiro/2026-11-20/plan-1-13';
  await page.goto(checkIn);
  const show = page.getByRole('button', { name: 'Mostrar à recepção' });
  await show.click();
  const dialog = page.getByRole('dialog', { name: 'Ilissos Hotel' });
  await expect(dialog.locator('article[lang="el"]')).toContainText('Trip.com');
  await expect(dialog.locator('dd')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Fechar janela' }).click();
  await page.goto(
    checkIn + '/guest=Test+Guest&confirmation=1111111111111111&booking=2222222222222222',
  );
  await expect(page).toHaveURL(/plan-1-13$/);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await show.click();
  await expect(dialog.locator('article[lang="el"]')).toContainText('Test Guest');
  await expect(dialog.locator('dd')).toHaveText(['1111111111111111', '2222222222222222']);
  await dialog.getByRole('button', { name: 'Inglês' }).click();
  await expect(dialog.locator('article[lang="en"]')).toContainText('I don’t speak English.');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.goto('./#roteiro/2026-11-23/nov-23-checkin');
  await expect(page.getByRole('heading', { name: 'Detalhes', exact: true })).toBeVisible();
  await expect(show).toHaveCount(0);
});
