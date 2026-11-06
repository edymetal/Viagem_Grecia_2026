import { test, expect } from '@playwright/test';

test('abre no dia atual da viagem e respeita escolhas explícitas', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-20T10:00Z') });
  for (const day of [20, 21, 22, 23]) {
    await page.clock.setSystemTime(new Date(`2026-11-${day}T10:00Z`));
    await page.goto('./#roteiro');
    await page.reload();
    await expect(page.getByRole('tab', { selected: true })).toContainText(`${day}/11`);
  }
  await page.getByRole('tab', { name: /21\/11/ }).click();
  await page.clock.runFor(30_000);
  await expect(page.getByRole('tab', { selected: true })).toContainText('21/11');
  await page.reload();
  await expect(page.getByRole('tab', { selected: true })).toContainText('21/11');
  await page.goto('./#inicio');
  await page.locator('.day-overview button').first().click();
  await expect(page.getByRole('tab', { selected: true })).toContainText('20/11');
});

test('muda automaticamente de dia à meia-noite em Atenas', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-20T21:59:45Z') });
  await page.goto('./#roteiro');
  await expect(page.getByRole('tab', { selected: true })).toContainText('20/11');
  await page.clock.runFor(30_000);
  await expect(page.getByRole('tab', { selected: true })).toContainText('21/11');
});

test('linha avança ao vivo e offline sem concluir visitas automaticamente', async ({
  page,
  context,
}) => {
  await page.clock.install({ time: new Date('2026-11-20T05:54:30Z') });
  await page.goto('./#roteiro');
  const current = page
    .locator('.compact-activity')
    .filter({ has: page.locator('#open-corr-1-wait') });
  await expect(current).toHaveAttribute('data-time-state', 'current');
  await expect(current.locator('.timeline-now')).toHaveText('Agora');
  await expect(current.locator('a')).toHaveAttribute('aria-current', 'step');
  const progress = () =>
    current.evaluate((el) =>
      parseFloat((el as HTMLElement).style.getPropertyValue('--time-progress')),
    );
  const initial = await progress();
  expect(initial).toBeCloseTo(50, 0);
  await context.setOffline(true);
  await page.clock.runFor(30_000);
  expect(await progress()).toBeGreaterThan(initial);
  await expect(page.locator('.day-section-heading')).toContainText('0/19 concluídas');
  await page.getByRole('tab', { name: /21\/11/ }).click();
  await expect(page.locator('[data-time-state="current"]')).toHaveCount(0);
  await expect(page.locator('[data-time-state="upcoming"]')).toHaveCount(24);
  await page.getByRole('tab', { name: /20\/11/ }).click();
  await page.clock.setSystemTime(new Date('2026-11-20T06:04:00Z'));
  await page.clock.runFor(30_000);
  await expect(current).toHaveAttribute('data-time-state', 'elapsed');
});
