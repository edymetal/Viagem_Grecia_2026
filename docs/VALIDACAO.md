# Validação da estrutura inicial

Verificação local em 05/11/2026, com Node 22.23.4 e Chromium do Playwright. O cronograma definitivo ainda não foi inserido. Nenhum teste usou documentos pessoais ou aparelhos físicos.

| Verificação                     | Resultado                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run check`                 | TypeScript sem erros                                                                                     |
| `npm test`                      | 13 testes aprovados, em 2 arquivos                                                                       |
| `npm run build`                 | Build aprovado, manifest e service worker gerados                                                        |
| `npm run test:e2e`              | 6 testes aprovados em Chromium com emulação Android                                                      |
| Subdiretório padrão             | `/Viagem_Grecia_2026/` aprovado, inclusive recarga offline                                               |
| Nome alternativo do repositório | Build e 6 testes de navegador aprovados com `/teste-pages/`                                              |
| Layout                          | 11 telas verificadas sem rolagem horizontal em 320, 390 e 1440 px; capturas clara e escura inspecionadas |
| Auditoria de produção           | `npm audit --omit=dev`: nenhuma vulnerabilidade                                                          |
| Auditoria das ferramentas       | 4 avisos baixos transitivos de `deepmerge` via Workbox; detalhes no README                               |

## Cobertura funcional

- Datas e contagem de dias no fuso `Europe/Athens`, incluindo a diferença de dia em relação à Itália e o horário de verão.
- Próxima atividade confirmada, status concluído, validação de horários e links e aviso de sobreposição.
- Criação, edição, reordenação, exclusão de opcionais e preservação de atividades obrigatórias.
- Orçamento e despesas, cálculos em centavos, distinção entre pago, previsto e realizado, inclusive despesas anteriores à viagem.
- Edição de hotel e informações úteis, checklist, persistência após recarregar.
- Armazenamento de arquivo local, exportação e restauração de backup com imagem, visualização da imagem após recarga offline.
- Navegação offline e manutenção de roteiro, gastos e checklist. Nenhuma requisição HTTP externa durante o fluxo de cadastro e backup testado.
- Rejeição de backups inválidos, versões incompatíveis, identificadores duplicados e arquivos adulterados.
- Restauração atômica: uma falha no meio não altera os dados ou a coleção de documentos anteriores.
- Falha de acesso ao IndexedDB exibe recuperação; falha de escrita por cota mantém o valor anterior e informa o usuário.

## Limites da validação

A instalação pelo menu do Chrome em Android físico, o leitor de PDF do aparelho, a abertura do aplicativo Google Maps e o deploy real no GitHub Pages dependem do dispositivo/ambiente final e ainda não foram executados. O workflow foi preparado segundo as ações oficiais, mas não foi disparado: publicação e push para o repositório público aguardam autorização. A emulação do Playwright não equivale a teste físico.

Os arquivos de build, relatórios, capturas e quaisquer backups baixados durante testes ficam fora do Git. O build final em `dist` usa o caminho padrão do repositório.
