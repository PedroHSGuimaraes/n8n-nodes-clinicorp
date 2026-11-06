# Clinicorp: node-cli 0.55 e campos guiados (versão 2 do node) checks

Build: `npm run build`; `npm run lint`; `npx tsc --noEmit`
Run unit: `node --test --test-reporter=spec test/*.test.cjs`
Plan: `.specs/features/node-cli-campos-v2/plan.md`

22 checks in 5 slices · 4 one-way doors · 0 open, of which 0 block

## Checks

### S1 - toolchain do node-cli 0.55.5

**C1** - `npm run build` sai com 0 e gera o node, a credencial e os ícones em `dist` (AC S1.1)
Proof: run unit | ✔ build gera node, credencial e ícones

**C2** - `package.json` usa `n8n-node build` e `n8n-node lint`, `n8n.strict`, `@n8n/node-cli` 0.55.5, sem `dependencies` e sem gulp; `n8n-workflow` `^2.46.5` no dev e `*` no peer, e o lock resolve 2.46.5 ou mais nova (AC S1.3, S1.4)
Proof: run unit | ✔ package.json segue o padrão do node-cli

**C3** - `npm run lint` imprime 0 erros (AC S1.2)
Proof: `npm run lint`

**C4** - `npm test` compila e roda `node --test test/*.test.cjs` com `# fail 0` (AC S1.5)
Proof: run unit | ✔ npm test compila e roda os testes

**C5** - o CI roda `npm ci`, lint, test e build, e usa a mesma `node-version` do publish (AC S1.6)
Proof: run unit | ✔ ci.yml roda ci, lint, test e build com a node-version do publish

### S2 - versão 1 continua igual

**C6** - v1 `patient get` com `patientId` `'p1'` chama `GET /patient/get` com `subscriber_id` e `PatientId=p1` (AC S2.1)
Proof: run unit | ✔ v1 patient get envia subscriber_id e PatientId

**C7** - v1 `appointment create` com `procedures` `'Limpeza, Restauração'` envia `Procedures` igual a esse texto (AC S2.2)
Proof: run unit | ✔ v1 appointment create envia Procedures em texto

**C8** - para `@version` 1, todo parâmetro tem o mesmo `name` e `type` da 1.1.2 (AC S2.3)
Proof: run unit | ✔ v1 mantém name e type de todo parâmetro da 1.1.2

**C9** - v1 com `fromTime` `'9h'` envia `'9h'` sem validar (AC S2.4)
Proof: run unit | ✔ v1 não valida o horário

### S3 - campos guiados na versão 2

**C10** - o node novo nasce com `typeVersion` 2 e expõe Procedures como `multiOptions` com `getProcedures` e Sex como `options` M e F, e a cor da categoria como `color` (AC S3.1, S3.2)
Proof: run unit | ✔ v2 expõe defaultVersion 2, procedimentos em lista e sexo em opções

**C11** - v2 envia `Procedures` igual a `Limpeza, Restauração` com dois escolhidos e omite o campo sem escolha (AC S3.3, S3.4)
Proof: run unit | ✔ v2 junta procedimentos com vírgula e omite quando vazio

**C12** - `getProcedures` chama `GET /procedures/list` uma vez e devolve nome nos dois campos, ordenado (AC S3.5)
Proof: run unit | ✔ getProcedures lista e ordena por nome

**C13** - v2 recusa horário fora de `HH:mm` antes de qualquer requisição, em Create e em Create Online Scheduling (AC S3.6)
Proof: run unit | ✔ v2 valida horário HH:mm antes da requisição

**C14** - v2 recusa ID vazio ou só com espaços de agendamento e orçamento antes de qualquer requisição e remove espaço das pontas (AC S3.7)
Proof: run unit | ✔ v2 valida ID obrigatório antes da requisição

**C15** - IDs de paciente, agendamento e orçamento da v2 têm `placeholder` e `description` que dizem a operação de origem (AC S3.8)
Proof: run unit | ✔ campos de ID têm placeholder e descrição de origem

### S4 - toda chamada tem timeout

**C16** - toda requisição de `clinicorpApiRequest` leva `timeout` 30000, na v1 e na v2 (AC S4.1)
Proof: run unit | ✔ requisição leva timeout de 30000

**C17** - timeout estourado vira `NodeApiError` e, com `continueOnFail`, o item `{ error }` (AC S4.2)
Proof: run unit | ✔ timeout vira NodeApiError ou item de erro

**C18** - `loadOptions` e o teste de credencial levam `timeout` 30000 (AC S4.3)
Proof: run unit | ✔ loadOptions e teste de credencial levam timeout

### S5 - lançamento 1.2.0, documentação e publicação

**C19** - `package.json` tem versão 1.2.0, `funding`, `prepublishOnly` `n8n-node prerelease`; o `CHANGELOG.md` tem `## 1.2.0` (AC S5.1)
Proof: run unit | ✔ metadados da 1.2.0 e changelog

**C20** - o README tem as seções do padrão do RD Station CRM, na ordem (AC S5.2)
Proof: run unit | ✔ README segue o padrão completo

**C21** - o publish tem `RELEASE_MODE`, `npm@12.2.2 stage publish`, `NPM_TOKEN`, `workflow_dispatch` e a node-version do CI (AC S5.3, S5.4)
Proof: run unit | ✔ publish.yml publica por stage com RELEASE_MODE

**C22** - depois que o dono aprova na aba Staged Packages, `npm view n8n-nodes-clinicorp version` imprime 1.2.0 (AC S5.5)
Proof: walk - o dono aprova a versão com 2FA no npmjs.com e roda `npm view n8n-nodes-clinicorp version`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `Surface` node v2 statuses (3) | 200 C11 · 401 C17 · 4xx e 5xx C17 | - |
| `Surface` node v1 statuses (3) | 200 C6 · 401 C17 · 4xx e 5xx C17 | - |
| `Surface` getProcedures statuses (2) | 200 C12 · 401 C18 | - |
| Landing: versão do node (1) | C10 | - |
| Landing: valor dos procedimentos (1) | C11 | - |
| Landing: versão do pacote (1) | C19 | - |
| Landing: timeout (1) | C16 | - |
| horários válidos e inválidos (6) | `14:00` C13 · `00:00` C13 · `23:59` C13 · `24:00` C13 · `9h` C13 · `9:5` C13 | - |
| IDs obrigatórios validados (4) | cancel C14 · confirm C14 · changeStatus C14 · estimate get C14 | - |
| campos de ID com dica (5) | C15, table-driven over all 5 | - |
| seções do README (16) | C20, table-driven over all 16 | - |

## Swept

- validation: C13, C14
- failure modes: C17
- idempotency: n/a - o node só repassa a requisição; a Clinicorp decide
- authorization: existing - a credencial Basic Auth e a resposta 401 da Clinicorp
- concurrency: n/a - cada item roda em série dentro do `execute`
- data lifecycle: n/a - o node não guarda dado
- dependency failure: C17, C18
- state transitions: n/a - o node não tem estado
- observability: n/a - sem requisito de log neste plano

## Handoff

- **Settled mid-build:** nenhuma
- **Dispatched:** Verifier (sonnet) no HEAD 8b783be, returned: não
- **Boundary:** C1-C21 fechados (S1 a S5); C22 é a aprovação do dono no npm
- **Abandoned:** nada
- **Walked:** n/a - sem tela capturada
