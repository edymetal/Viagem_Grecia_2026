import { test, expect } from '@playwright/test';

test('linha do tempo abre detalhes, mantém favoritos e visitas offline e volta ao mesmo dia', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./#roteiro');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  const offlineNotice = page.getByRole('button', { name: 'Dispensar aviso de cache' });
  if (await offlineNotice.isVisible()) await offlineNotice.click();
  await page.getByRole('button', { name: 'Escolher dia do roteiro', exact: true }).click();
  await page.getByRole('button', { name: /Dia 2 · sábado/ }).click();
  await expect(page.getByRole('tab', { selected: true })).toContainText('21/11');
  await expect(page.getByRole('tab', { selected: true })).not.toContainText('Dia');
  await expect(page.locator('.activity')).toHaveCount(14);
  const library = page
    .locator('.activity')
    .filter({ has: page.getByRole('heading', { name: 'Biblioteca de Adriano', exact: true }) });
  await expect(library).toContainText('Funcionamento: Inverno: 08h–15h');
  await expect(library.locator('img')).toHaveJSProperty('complete', true);
  await expect(page.getByRole('button', { name: /Mover .* para cima/ })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/roteiro-compacto.png', fullPage: false });
  await page
    .getByRole('link', {
      name: 'Ver detalhes: Acrópole e Partenon com guia em português',
      exact: true,
    })
    .click();
  await expect(page.getByRole('heading', { name: 'Detalhes', exact: true })).toBeVisible();
  await expect(page.locator('.visit-facts')).toContainText('14:30 – 16:30');
  await expect(page.locator('.detail-status')).toContainText('proposto');
  await expect(page.getByRole('link', { name: 'Ir no mapa', exact: true })).toHaveAttribute(
    'href',
    /google\.com\/maps\/search/,
  );
  await expect(page.getByRole('link', { name: /Reservar somente guia/ })).toHaveAttribute(
    'href',
    /getyourguide/,
  );
  await page.screenshot({ path: 'test-results/roteiro-detalhes.png', fullPage: false });
  await page.getByRole('button', { name: 'Adicionar aos favoritos' }).click();
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Concluir visita', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Desmarcar visita' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Editar observações', exact: true }).click();
  await page.getByLabel('Observações pessoais').fill('Nota de teste offline');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Detalhes', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Desmarcar visita' })).toBeVisible();
  await expect(page.getByText('Nota de teste offline')).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByRole('img', { name: 'Acrópole de Atenas e Partenon', exact: true })
        .evaluate((img: HTMLImageElement) => img.naturalWidth > 0),
    )
    .toBe(true);
  await page.goBack();
  await expect(page.getByRole('tab', { selected: true })).toContainText('21/11');
  await page.getByRole('button', { name: 'Favoritos', exact: true }).click();
  await expect(page.locator('.activity')).toHaveCount(1);
  await page
    .getByRole('link', {
      name: 'Ver detalhes: Acrópole e Partenon com guia em português',
      exact: true,
    })
    .click();
  await page.getByRole('button', { name: 'Remover dos favoritos' }).click();
  await page.getByRole('link', { name: 'Voltar ao roteiro' }).click();
  await expect(page.getByText('Nenhum favorito neste dia')).toBeVisible();
  expect(errors).toEqual([]);
});

test('detalhes e dias funcionam em links diretos, teclado e diferentes larguras', async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./#roteiro/2026-11-21/plan-2-11');
    await expect(page.getByRole('heading', { name: 'Detalhes', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('link', { name: 'Voltar ao roteiro' }).click();
    await expect(page.getByRole('tab', { selected: true })).toContainText('21/11');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('tab', { selected: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { selected: true })).toContainText('22/11');
  await expect(page.getByRole('tab', { selected: true })).toBeFocused();
  await page.goto('./#roteiro/2026-11-21/nao-existe');
  await expect(page.getByText('Atividade não encontrada.', { exact: false })).toBeVisible();
  await expect(page.locator('.activity')).toHaveCount(14);
  await page.goto('./#roteiro/2026-11-20/plan-1-01');
  await expect(page.getByText('Sem foto adicionada', { exact: true })).toBeVisible();
  await expect(page.locator('.detail-hero img')).toHaveCount(0);
  await page.goto('./#preferencias');
  await page.getByRole('button', { name: 'Alternar tema claro ou escuro' }).click();
  await page.goto('./#roteiro/2026-11-21/plan-2-11');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'test-results/roteiro-detalhes-escuro.png', fullPage: false });
});

test('foto pessoal anexada permanece nos detalhes e na linha do tempo offline', async ({
  page,
  context,
}) => {
  await page.goto('./#documentos');
  await page.getByRole('button', { name: 'Adicionar arquivo', exact: true }).click();
  await page.getByLabel('PDF ou imagem').setInputFiles({
    name: 'foto-local.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY1cAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await page.getByRole('button', { name: 'Guardar neste dispositivo' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('./#roteiro/2026-11-20/plan-1-01');
  await page.getByRole('button', { name: /Editar Chegar à estação/ }).click();
  await page.getByLabel('Fotografia local').selectOption({ label: 'foto-local.png' });
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.detail-hero img')).toHaveJSProperty('naturalWidth', 1);
  await page.getByRole('link', { name: 'Voltar ao roteiro' }).click();
  await expect(page.locator('.activity').first().locator('.activity-thumb')).toHaveJSProperty(
    'naturalWidth',
    1,
  );
});

test('fotos dos locais e horários fornecidos permanecem disponíveis offline', async ({
  page,
  context,
}) => {
  await page.goto('./#roteiro/2026-11-21');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  for (const [id, alt, hours] of [
    ['plan-2-03', 'Biblioteca de Adriano', '08h–15h'],
    ['plan-2-05', 'Exposição do Museu Kotsanas em Atenas', '10h–18h'],
    ['plan-3-13', 'Edifício do Museu da Acrópole', '09h–20h'],
  ]) {
    const day = id.startsWith('plan-2') ? '2026-11-21' : '2026-11-22';
    await page.goto(`./#roteiro/${day}/${id}`);
    await expect
      .poll(() =>
        page
          .getByRole('img', { name: alt, exact: true })
          .evaluate((img: HTMLImageElement) => img.naturalWidth > 0),
      )
      .toBe(true);
    await expect(page.locator('.visit-facts')).toContainText(hours);
    await expect(page.locator('.detail-photo-credit')).toContainText('CC BY');
    await page.getByRole('link', { name: 'Voltar ao roteiro' }).click();
    await expect(
      page.locator('.activity').filter({ has: page.getByRole('img', { name: alt, exact: true }) }),
    ).toContainText(hours);
  }
});
