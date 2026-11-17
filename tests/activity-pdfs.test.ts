import { describe, expect, it } from 'vitest';
import { activityPdfs, matchesPdfRule } from '../src/data/activityPdfs';

describe('identificação local de documentos', () => {
  it('reconhece nomes sem diferenciar acentos e maiúsculas', () => {
    const rule = activityPdfs({ id: 'plan-3-03' })[0];
    expect(matchesPdfRule('Atenas/ÁGORA-ANTIGA-exemplo.pdf', rule)).toBe(true);
    expect(matchesPdfRule('Atenas/outro.pdf', rule)).toBe(false);
  });
  it('distingue ingresso e pagamento do museu', () => {
    const [ticket, payment] = activityPdfs({ id: 'plan-2-05' });
    expect(matchesPdfRule('Kotsanas-exemplo.pdf', ticket)).toBe(true);
    expect(matchesPdfRule('Kotsanas-pagamento-exemplo.pdf', ticket)).toBe(false);
    expect(matchesPdfRule('Kotsanas-pagamento-exemplo.pdf', payment)).toBe(true);
  });
  it('não associa documentos a atividades sem regra', () => {
    expect(activityPdfs({ id: 'atividade-sem-documento' })).toEqual([]);
  });
});
