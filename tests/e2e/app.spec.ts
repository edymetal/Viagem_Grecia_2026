import { test, expect } from '@playwright/test';

test('editar, reordenar e excluir atividades opcionais preserva as obrigatórias', async ({
  page,
}) => {
  await page.goto('./#roteiro');
  for (const title of ['Primeira atividade', 'Segunda atividade']) {
    await page.getByRole('button', { name: 'Nova atividade', exact: true }).click();
    await page.getByLabel('Nome da atividade *').fill(title);
    if (title.startsWith('Primeira')) await page.getByLabel('Atividade obrigatória').check();
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
  await expect(
    page.getByRole('button', { name: 'Excluir Primeira atividade', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Mover Segunda atividade para cima' }).click();
  await expect(page.locator('.activity h3').first()).toHaveText('Segunda atividade');
  await page.getByRole('button', { name: 'Editar Segunda atividade', exact: true }).click();
  await page.getByLabel('Observações pessoais').fill('Anotação preservada no dispositivo');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await page.reload();
  await expect(page.locator('.activity h3').first()).toHaveText('Segunda atividade');
  await page.locator('.activity').first().locator('summary').click();
  await expect(page.getByText('Anotação preservada no dispositivo')).toBeVisible();
  await page.getByRole('button', { name: 'Excluir Segunda atividade', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Excluir atividade', exact: true })
    .click();
  await expect(page.locator('.activity h3')).toHaveText(['Primeira atividade']);

  await page.goto('./#hotel');
  await page.getByRole('button', { name: 'Editar hotel' }).click();
  await page.getByLabel('Nome do hotel').fill('Hospedagem de teste');
  await page.getByLabel('Endereço', { exact: true }).fill('Endereço local de teste');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await page.goto('./#informacoes');
  await page.getByRole('button', { name: 'Editar informações' }).click();
  await page.getByLabel('Frases em grego', { exact: true }).fill('Texto fornecido para teste');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await page.reload();
  await expect(page.getByText('Texto fornecido para teste')).toBeVisible();
});

test('falha ao salvar avisa o usuário e mantém o valor anterior', async ({ page }) => {
  await page.goto('./#gastos');
  await page.getByRole('button', { name: 'Definir orçamento' }).click();
  await page.getByLabel('Orçamento total em euros').fill('100');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.locator('.stat').first().locator('strong')).toContainText('100,00');
  await page.getByRole('button', { name: 'Definir orçamento' }).click();
  await page.getByLabel('Orçamento total em euros').fill('500');
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (
      this: IDBDatabase,
      ...args: Parameters<typeof original>
    ) {
      if (args[1] === 'readwrite') {
        IDBDatabase.prototype.transaction = original;
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
      return original.apply(this, args);
    } as typeof original;
  });
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.locator('main > [role="alert"]')).toContainText('Armazenamento cheio');
  await page.getByRole('button', { name: 'Fechar janela' }).click();
  await expect(page.locator('.stat').first().locator('strong')).toContainText('100,00');
  await page.reload();
  await expect(page.locator('.stat').first().locator('strong')).toContainText('100,00');
});

test('roteiro, despesas, checklist, documentos e backup persistem offline', async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  const remoteRequests: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url()) && !r.url().startsWith('http://127.0.0.1:4173/'))
      remoteRequests.push(r.url());
  });
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Olá, viajante.' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navegação inferior' })
    .getByRole('link', { name: 'Roteiro' })
    .click();
  await expect(page.getByText('Um dia de possibilidades')).toBeVisible();
  await page.getByRole('button', { name: 'Nova atividade', exact: true }).click();
  await page.getByLabel('Nome da atividade *').fill('Atividade de teste local');
  await page.getByLabel('Início · horário de Atenas').fill('10:00');
  await page.getByLabel('Término · mesmo dia').fill('11:00');
  await page.getByLabel('Confirmação', { exact: true }).selectOption('Confirmada');
  await page.getByLabel('Endereço', { exact: true }).fill('Endereço de teste, Atenas');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Atividade de teste local' })).toBeVisible();
  await page.getByRole('button', { name: 'Concluir visita', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Desmarcar visita' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Desmarcar visita' })).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Navegação inferior' })
    .getByRole('link', { name: 'Gastos' })
    .click();
  await page.getByRole('button', { name: 'Definir orçamento' }).click();
  await page.getByLabel('Orçamento total em euros').fill('150');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await page.getByRole('button', { name: 'Nova despesa', exact: true }).click();
  await page.getByLabel('Descrição *').fill('Despesa de teste');
  await page.getByLabel('Valor (€) *', { exact: true }).fill('12.50');
  await page.getByLabel('Data da despesa *').fill('2026-11-05');
  await page.getByLabel('Tipo de gasto').selectOption('Realizado');
  await page.getByLabel('Despesa paga').check();
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.locator('.balance strong')).toContainText('137,50');
  await page.goto('./#checklist');
  await page.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  await page.getByLabel('O que precisa ser feito?').fill('Item de teste');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await page.getByRole('button', { name: 'Concluir Item de teste' }).click();
  await expect(page.getByRole('button', { name: 'Desmarcar Item de teste' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.goto('./#documentos');
  await page.getByRole('button', { name: 'Adicionar arquivo', exact: true }).click();
  await page.getByLabel('PDF ou imagem').setInputFiles({
    name: 'teste.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY1cAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await page.getByRole('button', { name: 'Guardar neste dispositivo' }).click();
  await expect(page.getByRole('heading', { name: 'teste.png' })).toBeVisible();

  await page.goto('./#backup');
  await page.getByLabel('Incluir documentos').check();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar backup', exact: true }).click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(path).toBeTruthy();
  await page.getByLabel('Arquivo JSON de backup').setInputFiles(path!);
  await page.getByRole('button', { name: 'Verificar backup', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Confirmar restauração' })).toBeVisible();
  await page.getByLabel('Entendo que os dados atuais').check();
  await page.getByRole('button', { name: 'Restaurar dados', exact: true }).click();
  await expect(page.getByText('Dados restaurados neste dispositivo.')).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('./#documentos');
  await expect(page.getByText('Você está offline.')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('img', { name: 'teste.png' })).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('img')).toHaveJSProperty('naturalWidth', 1);
  await page.getByRole('button', { name: 'Fechar janela' }).click();
  await page.goto('./#roteiro');
  await expect(page.getByRole('button', { name: 'Desmarcar visita' })).toBeVisible();
  await page.goto('./#gastos');
  await expect(page.locator('.balance strong')).toContainText('137,50');
  await page.goto('./#checklist');
  await expect(page.getByRole('button', { name: 'Desmarcar Item de teste' })).toBeVisible();
  expect(errors).toEqual([]);
  expect(remoteRequests).toEqual([]);
});

test('layout sem rolagem horizontal e navegação em 320, 390 e 1440 pixels', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1050 : 844 });
    for (const section of [
      'inicio',
      'roteiro',
      'mapa',
      'gastos',
      'mais',
      'documentos',
      'hotel',
      'checklist',
      'informacoes',
      'backup',
      'preferencias',
    ]) {
      await page.goto(`./#${section}`);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.goto('./#inicio');
  await page.screenshot({ path: 'test-results/atenas-desktop.png', fullPage: true });
  await page.goto('./#inicio');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/atenas-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Alternar tema claro ou escuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'test-results/atenas-dark.png', fullPage: true });
});

test('backup inválido é rejeitado e formulário não substitui os dados', async ({ page }) => {
  await page.goto('./#backup');
  await page.getByLabel('Arquivo JSON de backup').setInputFiles({
    name: 'invalido.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":999}'),
  });
  await page.getByRole('button', { name: 'Verificar backup', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Backup inválido');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('falha no IndexedDB mostra recuperação sem substituir os dados', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      value: {
        open() {
          throw new Error('Blocked for test');
        },
      },
    });
  });
  await page.goto('./');
  await expect(page.getByRole('alert')).toContainText('Não foi possível abrir os dados locais');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
});
