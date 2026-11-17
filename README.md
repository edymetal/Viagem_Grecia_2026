# Atenas e Roma 2026

Aplicativo pessoal de viagem de Santo Stefano di Camastra a Atenas e Roma, de **20 a 26/11/2026**. Interface em português brasileiro e valores em euros. React, TypeScript, Vite, Tailwind CSS, Lucide, IndexedDB, Zod e PWA.

Confira o [cronograma atualizado e as fontes](docs/CRONOGRAMA.md). O app diferencia atividades confirmadas, planejadas e pendentes e mostra os horários no fuso de cada trecho. Códigos de reserva e documentos ficam no navegador.

## Instalar e executar

O visual segue a referência mobile enviada: azul e branco, cabeçalho compacto, atalhos com ícones coloridos, fotos, resumo em cartões e linha do tempo azul. O tema visual está em `src/native.css`, sobre os estilos compartilhados de layout/formulários em `src/styles.css`. Os dados da viagem e o armazenamento são preservados. As fotos são arquivos locais e entram no cache da PWA; autoria e licenças estão em [public/images/CREDITS.md](public/images/CREDITS.md). O mapa permite buscar os destinos já cadastrados sem conexão e continua abrindo as rotas por links do Google Maps.

**No Windows, clique duas vezes em `Abrir Atenas.cmd`, na pasta do projeto.** O iniciador prepara os arquivos quando necessário, inicia o aplicativo em segundo plano e abre o navegador. Nos próximos usos, basta abrir o mesmo arquivo novamente. É necessário Node.js 22.12 ou superior; se as dependências ainda não estiverem instaladas, a primeira abertura usa a internet para instalá-las.

O iniciador mantém `http://127.0.0.1:5173/Viagem_Grecia_2026/`, preservando o endereço dos dados locais usados durante o desenvolvimento. Se o aplicativo já estiver aberto nesse endereço, o servidor é reutilizado. Não abra `index.html` diretamente. Você também pode criar um atalho do arquivo `.cmd` na Área de Trabalho.

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

## Usar o roteiro

- As abas mostram apenas data e dia da semana. Os horários da linha do tempo têm maior destaque. Fotos de locais de visitação são arquivos locais (créditos e licenças em `public/images/CREDITS.md`) e os horários de funcionamento fornecidos aparecem também na lista; dados ausentes são indicados sem suposição.

- Entre 20 e 26/11/2026, abrir **Roteiro** seleciona o dia atual pelo calendário local em Atenas ou Roma, inclusive ao virar a meia-noite com a tela aberta. As abas, o calendário, os cartões do início e os links diretos continuam permitindo escolher outro dia.
- A linha dos horários preenche em azul conforme o tempo passa, respeitando os fusos de cada etapa na Itália e em Atenas. **Agora** indica o trecho atual; horários futuros permanecem sem preenchimento e dias passados aparecem preenchidos. O avanço funciona offline e não marca visitas como concluídas: essa confirmação continua manual.
- Toque em qualquer atividade da linha do tempo para abrir **Detalhes**: fotografia local quando disponível, preço e sua natureza, programação, funcionamento, duração, transporte, links e observações. Nenhuma avaliação turística ou foto de outro local é criada para preencher campos ausentes.
- Use o coração para favoritar e o filtro **Favoritos** para ver os salvos no dia selecionado. Favoritos, visitas concluídas e edições ficam no IndexedDB e também são incluídos nos backups. Backups anteriores sem favoritos continuam compatíveis.
- Em **Detalhes**, use **Concluir visita**, **Editar** ou **Editar observações**. Para reordenar ou excluir atividades opcionais, ative **Organizar** na lista; as obrigatórias não têm botão de exclusão. A reordenação é desativada enquanto o filtro de favoritos está ativo para não ocultar atividades intermediárias.
- O botão de voltar e o gesto de voltar do Android retornam à lista. Links como `#roteiro/2026-11-21/plan-2-11` abrem diretamente os detalhes e funcionam ao recarregar, inclusive offline após o cache inicial.
- As fotos fornecidas com o app e os documentos locais ficam disponíveis offline. Google Maps, sites oficiais e compra de ingressos continuam dependendo de internet.

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

Para abrir os ingressos do telefone, vá em **Mais → Documentos → Escolher pasta Viagem** e autorize a leitura de **Armazenamento interno → Documents → Viagem** no seletor do Android. Os PDFs da pasta e das subpastas aparecem na lista. Toque no nome de um PDF para abrir o arquivo original, inclusive offline. O app guarda no navegador somente a referência à pasta. Se o Chrome pedir acesso ao voltar ao app, use **Autorizar acesso à pasta**.

O botão **Adicionar arquivo** permite guardar cópias locais de documentos selecionados. A reimportação de um arquivo com o mesmo nome e conteúdo preserva as referências e a categoria do documento guardado.

O Workbox pré-armazena HTML, JavaScript, CSS e ícones no escopo do aplicativo. As telas offline usam fontes e fotos locais. O mapa online carrega imagens externas do OpenStreetMap; elas não são pré-armazenadas pelo service worker. As cópias salvas pelo botão **Adicionar arquivo** ficam no IndexedDB. Os PDFs de uma pasta autorizada são lidos quando você abre o arquivo. Uma atualização de código é oferecida ao usuário; finalize os formulários antes de atualizar. Dados locais não são substituídos por uma atualização.

Google Maps, compra de ingressos e sites externos precisam de internet. O app não guarda mapas nem calcula rotas. Os links do Google Maps podem abrir o aplicativo Android conforme a configuração do aparelho. Sem endereço, o link não é criado. O indicador de conexão reflete o estado informado pelo navegador, sem garantir acesso a serviços externos.

## O que funciona

- Início: contagem de dias, dia atual em Atenas, próxima atividade planejada/confirmada com horário e fuso local, gastos, visitas, pendências e atalhos. Sugestões não entram como próxima atividade.
- Roteiro: quatro dias, atividades extras, horários editáveis, descrição, preços, links, transporte, fotos locais, notas, confirmação, obrigatoriedade, conclusão e reordenação por botões acessíveis. Atividades opcionais podem ser excluídas. Aviso de sobreposição quando início e término estão preenchidos.
- Mapa: mapa interativo **online** com Leaflet 1.9.4, tiles OpenStreetMap e dez locais com coordenadas verificadas. O card Pontos no mapa aparece no topo, substituindo a introdução anterior. A busca filtra os pontos; tocar em um marcador abre uma janela com foto ou ícone, horário, endereço, funcionamento, status e links para atividade, localização e rotas. A janela respeita o tema, usa a foto pessoal quando cadastrada e pode ser fechada pelo botão ou Escape. Referências em `src/data/map-points.json`. Pontos com endereço editado são omitidos para não associar coordenadas antigas a outro destino; locais sem coordenadas permanecem nos cards. Offline, o mapa é substituído por um aviso e os cards continuam disponíveis. Não há geocodificação automática, geolocalização, chave privada nem pré-download de tiles; o cache normal do navegador segue os cabeçalhos do provedor. Cards com foto local (prioridade para fotografias pessoais), data/horário e fuso, status, endereço, funcionamento informado, botão principal de localização e atalhos para rotas a pé/transporte público. Detalhes do deslocamento ficam recolhidos, com acesso direto à atividade correspondente. Busca sem acentos, card de hospedagem e temas claro/escuro. Fotos e dados são locais; Google Maps continua dependendo de internet. Nenhuma rota presumida.
- Gastos: abas **Resumo** e **Lançamentos**, total realizado em destaque, barra de consumo do orçamento, categorias com ícones coloridos e acesso aos lançamentos por toque. O seletor Realizados/Previstos altera apenas os valores da lista de categorias; o total e a barra sempre consideram realizados. Sem orçamento, a porcentagem aparece como não definida; orçamento zero ou excedido recebe tratamento próprio. Orçamento, CRUD de despesas nas oito categorias, previsto/realizado, pago/não pago, saldo, resumo por categoria e gráfico por dia. Faixas mínimo/máximo preservam estimativas; despesas pagas ou realizadas exigem valor exato. As 11 previsões iniciais totalizam €441,81–481,81, sem hotel e guias; nenhum gasto realizado ou pago foi criado. O saldo usa apenas realizados; o saldo projetado considera a faixa prevista. Preços de atividades não geram despesas automaticamente.
- Mais: documentos offline, hotel, voos, referências de reservas, checklist, informações úteis, frases PT/IT/EL, backup e preferências de tema.

## Dados locais e privacidade

IndexedDB `atenas-2026` guarda o estado da viagem e as cópias de arquivos. O banco `atenas-pdf-folder` guarda a referência à pasta autorizada. O banco `atenas-weather` guarda o último boletim meteorológico validado. A referência à pasta e o cache meteorológico ficam neste aparelho, fora dos backups da viagem. LocalStorage guarda **somente o tema**. SessionStorage guarda temporariamente o dia escolhido no dashboard. Não há analytics, transmissão de documentos, sincronização ou armazenamento remoto.

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

## Cronograma recebido e instalações anteriores

Consulte [docs/CRONOGRAMA.md](docs/CRONOGRAMA.md). As atividades estão em `src/data/itineraryActivities.ts` e os demais dados iniciais em `src/data/itinerary.ts`. `src/data/initial.ts` fornece o plano para novas instalações. Os contratos ficam em `src/data/schema.ts`. Campos ausentes são vazios ou `null`. Fusos Itália/Atenas, preços consultados, estimativas e horários propostos são explícitos. Não coloque códigos de reservas, comprovantes ou documentos privados nesses arquivos públicos.

As revisões anteriores conhecidas recebem a atualização automaticamente. Para estados ainda sem cronograma ou de outra revisão, use **Incorporar cronograma** no aviso do aplicativo. A incorporação acrescenta o plano uma vez, mantém atividades já existentes com o mesmo ID ou nome/dia, preserva orçamento, arquivos, reservas, hotel já informado e campos já preenchidos. As despesas previstas ficam desmarcadas por padrão quando já houver gastos locais, para evitar duplicidade. Faça um backup antes e revise eventuais sobreposições. Restaurar backup continua sendo uma operação separada de substituição integral.

Os gastos e estimativas atuais estão no [cronograma](docs/CRONOGRAMA.md) e na aba **Gastos**. Ao registrar gastos realizados, ajuste as previsões correspondentes.

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

Não há sincronização entre dispositivos, criptografia de backup, OCR, leitura automática de QR, mapas offline ou cálculo de deslocamentos. O mapa online depende da disponibilidade dos tiles OpenStreetMap, e os cards continuam utilizáveis em caso de falha. A contagem até a partida permanece em dias de calendário de Atenas. A próxima atividade e conflitos convertem os horários locais usando os fusos IANA Europe/Rome e Europe/Athens; o aparelho pode estar em outro fuso. Intervalos que cruzam meia-noite devem ser divididos por dia. A detecção não infere deslocamentos. O roteiro padrão está organizado sem sobreposições de horários. Despesas podem ser registradas fora das datas do roteiro, inclusive compras antecipadas. Interface e cache exigem navegadores modernos com IndexedDB e service workers (HTTPS ou localhost).

Implementação alinhada à [documentação do Vite PWA](https://vite-pwa-org.netlify.app/guide/), à [integração Tailwind/Vite](https://tailwindcss.com/docs/installation/using-vite) e ao [workflow oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Auditoria de dependências

O `glob` transitivo do Workbox é atualizado por `overrides` para uma versão corrigida. Na auditoria de 05/11/2026, restam quatro avisos de severidade baixa na cadeia de build do Workbox decorrentes de `deepmerge`, [ainda sem versão corrigida publicada](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). Essas dependências não são enviadas no código do navegador e não recebem backups ou documentos do usuário. `npm audit --omit=dev` não apontou vulnerabilidades nas dependências de produção. Reavalie a auditoria ao atualizar as ferramentas; não aplique `npm audit fix --force` sem revisar compatibilidade.

O mapa online segue a [política de tiles OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/), com atribuição visível e carregamento apenas da região visualizada. O provedor recebe requisições de tiles (IP e referência do site), sem documentos, reservas ou estado pessoal. As coordenadas são referências de locais, não confirmação de entradas ou pontos de encontro dos guias.


## Tempo e temperatura de Atenas

Ao lado do relógio aparece a temperatura em °C e a condição do tempo, com ícone e descrição em português. No celular, a faixa também é exibida nas telas de Roteiro e Gastos. Toque na temperatura para ver a condição atual, referência dos dados e previsão datada de até quatro dias com mínimas, máximas e chance de chuva. O fuso utilizado é sempre `Europe/Athens`, sem usar a localização do aparelho. Essa previsão corresponde às datas exibidas, não automaticamente aos dias da viagem.

O [Open-Meteo](https://open-meteo.com/en/docs) fornece os dados sem chave para este uso pessoal não comercial, sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). O app consulta apenas coordenadas fixas do centro de Atenas, sem documentos ou dados pessoais. O provedor recebe a requisição meteorológica e informações normais de conexão, como IP. A disponibilidade depende do serviço e da internet. A atribuição é acessível na janela de previsão.

A consulta é compartilhada entre as versões desktop/mobile, com cache de 15 minutos, atualização ao retomar o aplicativo e intervalo de 15 minutos enquanto visível. Respostas são validadas quanto a unidades, valores e séries. Em falha ou offline, os dados existentes são identificados como **Salvo**, com data e hora; sem cache, aparece **Tempo indisponível**, sem inventar temperatura. As requisições têm limite de espera de dez segundos e não bloqueiam as telas da viagem. O service worker não armazena respostas meteorológicas remotas; a última consulta é mantida separadamente no IndexedDB.
