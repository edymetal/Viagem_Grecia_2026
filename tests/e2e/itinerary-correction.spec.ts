import { test, expect } from '@playwright/test';
import { previousItinerary } from '../../src/lib/itinerary';
import { ITINERARY_REVISION } from '../../src/data/itinerary';

test('instalação existente recebe a correção offline sem duplicar nem perder dados locais', async ({
  page,
  context,
}) => {
  const old = previousItinerary();
  old.budget = 900;
  old.activities.find((a) => a.id === 'plan-2-03')!.notes = 'Observação particular preservada';
  old.activities.find((a) => a.id === 'plan-2-03')!.favorite = true;
  old.activities.find((a) => a.id === 'plan-2-03')!.completed = true;
  old.expenses[0].status = 'Realizado';
  old.expenses[0].paid = true;
  await page.goto('./');
  await page.evaluate(async (state) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('atenas-2026', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['state', 'documents'], 'readwrite');
        tx.objectStore('state').put(state, 'current');
        const blob = new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' });
        tx.objectStore('documents').put({
          id: 'particular',
          name: 'documento-teste.pdf',
          type: blob.type,
          category: 'Outros',
          size: blob.size,
          createdAt: new Date().toISOString(),
          blob,
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, old);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('./#roteiro');
  await page.reload();
  await expect(page.locator('.activity')).toHaveCount(19);
  await expect(page.getByText('Revise os horários', { exact: true })).toHaveCount(0);
  await page.getByRole('tab', { name: /21\/11/ }).click();
  await expect(page.locator('.activity')).toHaveCount(24);
  await page
    .getByRole('link', { name: 'Ver detalhes: Biblioteca de Adriano', exact: true })
    .click();
  await expect(page.locator('.visit-facts')).toContainText('09:00 – 09:35');
  await expect(page.getByText('Observação particular preservada')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Desmarcar visita' })).toBeVisible();
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.goto('./#roteiro/2026-11-22/plan-3-14');
  await expect(page.getByRole('heading', { name: /Finalizar a visita e sair/ })).toBeVisible();
  await expect(page.locator('.visit-facts')).toContainText('16:30 – 16:40');
  await page.goto('./#hotel');
  await expect(page.locator('.hotel-card')).toContainText('20h55–21h15');
  await page.goto('./#gastos');
  await expect(page.locator('.trip-total-value')).toContainText('206,01');
  await expect(page.locator('.stat').first()).toContainText('900,00');
  await expect(page.locator('.expense')).toHaveCount(11);
  await page.goto('./#documentos');
  await expect(page.getByRole('heading', { name: 'documento-teste.pdf' })).toBeVisible();
  const saved = await page.evaluate(
    async () =>
      new Promise<{ revision: string; count: number }>((resolve) => {
        const r = indexedDB.open('atenas-2026', 1);
        r.onsuccess = () => {
          const db = r.result;
          const read = db.transaction('state').objectStore('state').get('current');
          read.onsuccess = () => {
            db.close();
            resolve({
              revision: read.result.itineraryRevision,
              count: read.result.activities.length,
            });
          };
        };
      }),
  );
  expect(saved).toEqual({ revision: ITINERARY_REVISION, count: 89 });
});
