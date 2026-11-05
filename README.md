# Atenas 2026

Aplicativo pessoal de viagem para **uma pessoa, de Palermo a Atenas, de 20 a 23/11/2026**. Interface em português brasileiro e valores em euros. React, TypeScript, Vite, Tailwind CSS, Lucide, IndexedDB (`idb`), Zod e PWA (`vite-plugin-pwa` / Workbox). Front-end estático, sem autenticação, back-end, serviços pagos ou chaves privadas.

O cronograma definitivo ainda não foi fornecido. Os quatro dias estão preparados e vazios. Não foram inventados horários, atrações, telefones, preços ou reservas.

## Instalar e executar

Requer Node.js **22.12 ou superior** e npm. Versões exatas das dependências são registradas no `package-lock.json`.

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite, incluindo `/Viagem_Grecia_2026/`. O service worker fica ativo apenas no build de produção, para não interferir no desenvolvimento.

```sh
npm run check
npm test
npm run build
npm run preview
```

Para testes de navegador:

```sh
npx playwright install chromium
npm run test:e2e
```

Os testes de navegador usam a versão já compilada em `dist`, com viewport e toque equivalentes a Android/Chromium; não substituem um teste em aparelho físico. O projeto não depende de conexão com aparelhos pessoais.

## Publicar no GitHub Pages

O código está preparado para publicação; enviar para `main` dispara o workflow. **Não envie para `main` antes de autorizar a publicação.**

1. Use um repositório público, sem documentos pessoais ou backups no histórico.
2. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.
3. Depois de autorizar a publicação, envie o código para a branch `main`.
4. O workflow `.github/workflows/deploy.yml` instala dependências com `npm ci`, verifica TypeScript, executa testes, compila, testa a PWA em Chromium e publica `dist` com as ações oficiais `configure-pages`, `upload-pages-artifact` e `deploy-pages`.
5. A URL será `https://USUARIO.github.io/NOME-REPOSITORIO/`. Certifique-se de que Actions e o ambiente `github-pages` estejam habilitados no repositório.

O workflow fornece `GITHUB_REPOSITORY`: Vite extrai automaticamente o nome e configura `base`, manifest, `start_url`, `scope`, fallback e service worker no mesmo subdiretório. Repositórios `USUARIO.github.io` usam `/`. Para outro nome ou preview local, defina `VITE_BASE_PATH` começando e terminando com `/`:

```powershell
$env:VITE_BASE_PATH='/outro-repositorio/'
npm run build
npm run test:e2e
```

Em bash: `VITE_BASE_PATH=/outro-repositorio/ npm run build` (use a mesma variável nos testes). Sem variável, o caminho local padrão é `/Viagem_Grecia_2026/`. Não configure `base` como `./`: o escopo da PWA precisa ser consistente. A navegação usa fragmentos (`#roteiro` etc.), sem necessidade de redirecionamento do GitHub Pages.

## Usar e instalar no Android

1. Abra a URL HTTPS no Chrome para Android e aguarde a mensagem **Aplicativo pronto para uso offline** no primeiro carregamento.
2. Toque em **Instalar app** (ícone de download no celular). Se a instalação direta não estiver disponível, use o menu ⋮ do Chrome → **Adicionar à tela inicial / Instalar aplicativo**.
3. Abra novamente o app, desligue a conexão e confira roteiro, gastos, checklist e arquivos adicionados.

O Workbox pré-armazena HTML, JavaScript, CSS e ícones no escopo do aplicativo. Não usa fontes, imagens remotas ou APIs para renderizar as telas. Documentos e fotografias são blobs locais em IndexedDB. Uma atualização de código é oferecida ao usuário; finalize os formulários antes de atualizar. Dados locais não são substituídos por uma atualização.

Google Maps, compra de ingressos e sites externos precisam de internet. O app não guarda mapas nem calcula rotas. Os links do Google Maps podem abrir o aplicativo Android conforme a configuração do aparelho. Sem endereço, o link não é criado. O indicador de conexão reflete o estado informado pelo navegador, sem garantir acesso a serviços externos.

## O que funciona

- Início: contagem de dias, dia atual em Atenas, próxima atividade confirmada com horário, gastos, visitas e atalhos.
- Roteiro: quatro dias, atividades extras, horários editáveis, descrição, preços, links, transporte, fotos locais, notas, confirmação, obrigatoriedade, conclusão e reordenação por botões acessíveis. Atividades opcionais podem ser excluídas. Aviso de sobreposição quando início e término estão preenchidos.
- Mapa: lista dos destinos informados, localização e navegação a pé/transporte público por links externos. Nenhuma rota presumida.
- Gastos: orçamento, CRUD de despesas nas oito categorias, previsto/realizado, pago/não pago, saldo e gráficos por categoria/dia. O saldo usa apenas realizados; o saldo projetado inclui previstos. Valores pagos podem incluir uma despesa ainda classificada como prevista. Preços de atrações e transporte não viram despesas automaticamente.
- Mais: documentos offline, hotel, voos, referências de reservas, checklist, informações úteis, frases PT/IT/EL, backup e preferências de tema.

## Dados locais e privacidade

IndexedDB `atenas-2026` guarda o estado da viagem e os arquivos. LocalStorage guarda **somente o tema**. SessionStorage guarda temporariamente o dia escolhido no dashboard. Não há analytics, transmissão de documentos, sincronização ou armazenamento remoto.

Arquivos aceitos: PDF, PNG, JPEG e WebP, incluindo imagens/PDF com códigos QR. Limite por arquivo: 10 MB; documentos totais: 50 MB e 100 arquivos, sujeito à cota do navegador. O tipo e a assinatura básica são verificados; isso não é análise antivírus. O leitor de PDF depende do navegador; há download para abrir num leitor local. QR é visualizado como imagem/PDF, sem geração ou leitura automática.

Dados são específicos do navegador, perfil, domínio e dispositivo. Limpar dados do site, usar modo anônimo ou mudar a URL/perfil pode remover ou separar os dados. O botão **Proteger dados locais** solicita persistência ao navegador, que pode recusar. Essa opção não impede exclusão manual. Faça backups e mantenha os arquivos originais. Os arquivos `.gitignore` excluem diretórios convencionais de backups e documentos, mas revise sempre o que será enviado ao Git.

## Exportar e importar

Em **Mais → Backup e restauração**, baixe um JSON validado com formato `atenas-2026-backup`, versão `1`, data de exportação, estado e tema.

- A exportação padrão **não inclui documentos/fotos**.
- Marque **Incluir documentos e imagens locais** para embutir os arquivos em base64. O JSON cresce e **não tem criptografia**: guarde em local seguro e nunca publique no GitHub.
- Para restaurar, selecione um JSON de até 80 MB. O app valida estrutura, versão, limites, IDs duplicados, horários, URLs e arquivos antes de pedir confirmação.
- A confirmação substitui roteiro, despesas, orçamento, configurações, checklist, hotel, voos, reservas e informações úteis. Não faz mesclagem.
- Se o backup incluir documentos, eles substituem **todos** os arquivos locais em uma transação com os dados. Sem documentos, os existentes são mantidos. Referências a arquivos ausentes são removidas para evitar vínculos quebrados.
- Em caso de cota cheia ou erro, a transação de restauração não é aplicada parcialmente. O tema é uma preferência simples salva separadamente, com aviso se LocalStorage estiver bloqueado.

Não existem backups automáticos nem envio a servidores. A escolha do local do arquivo baixado é do navegador/Android.

## Incorporar o cronograma depois

Consulte [docs/CRONOGRAMA.md](docs/CRONOGRAMA.md). Os dados ficam separados da interface em `src/data/initial.ts` e o contrato validado em `src/data/schema.ts`. Campos ausentes são vazios ou `null`. Confirmações e estimativas são explícitas. Não coloque códigos de reservas, comprovantes ou documentos privados nesses arquivos públicos.

Uma instalação que já tem dados preserva suas edições. Alterar o módulo inicial não sobrescreve esse estado; use um backup completo revisado para restaurar o cronograma no dispositivo, exportando antes a versão atual.

## Estrutura

```text
.github/workflows/deploy.yml  # CI e publicação após push autorizado
public/                      # Ícones locais da PWA
src/
  components/                # Formulários, diálogo, links e ilustração vetorial
  data/                      # Estado inicial e contratos Zod
  hooks/useTravel.ts         # Operações persistentes serializadas e erros
  lib/                       # IndexedDB, backup, fuso, finanças e links
  pages/                     # Início, roteiro, mapa, gastos e módulos de Mais
  App.tsx                    # Navegação por hash, instalação, tema e conexão
  main.tsx                   # Entrada e tratamento de erro de renderização
  styles.css                 # Tailwind e estilos responsivos
tests/                       # Testes de domínio, armazenamento e navegador
docs/CRONOGRAMA.md            # Contrato e procedimento de integração
vite.config.ts               # Base path, PWA, cache e escopo
```

## Limites conhecidos

Não há sincronização entre dispositivos, criptografia de backup, OCR, leitura automática de QR, mapas offline ou cálculo de deslocamentos. A contagem até a partida considera dias de calendário em Atenas, pois o horário do voo ainda não foi fornecido. A detecção de conflito usa intervalos no mesmo dia e não infere deslocamentos. Despesas podem ser registradas fora das datas do roteiro, inclusive compras antecipadas; o gráfico diário inclui essas datas. Interface e cache exigem navegadores modernos com IndexedDB e service workers (HTTPS ou localhost).

Implementação alinhada à [documentação do Vite PWA](https://vite-pwa-org.netlify.app/guide/), à [integração Tailwind/Vite](https://tailwindcss.com/docs/installation/using-vite) e ao [workflow oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Auditoria de dependências

O `glob` transitivo do Workbox é atualizado por `overrides` para uma versão corrigida. Na auditoria de 05/11/2026, restam quatro avisos de severidade baixa na cadeia de build do Workbox decorrentes de `deepmerge`, [ainda sem versão corrigida publicada](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). Essas dependências não são enviadas no código do navegador e não recebem backups ou documentos do usuário. `npm audit --omit=dev` não apontou vulnerabilidades nas dependências de produção. Reavalie a auditoria ao atualizar as ferramentas; não aplique `npm audit fix --force` sem revisar compatibilidade.
