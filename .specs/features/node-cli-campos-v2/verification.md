# Clinicorp: node-cli 0.55 e campos guiados (versão 2 do node) verification

**Verdict**: FAIL
**Proofs**: `proofs.md` at edd0663
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `estrutura.test.cjs` `build gera node, credencial e ícones` | yes - weak: checks `scripts.build` and that the files exist in `dist`, so a stale `dist` also passes; `npm test` rebuilds first |
| C2 | `estrutura.test.cjs` `package.json segue o padrão do node-cli` | yes |
| C3 | `npm run lint` (lone proof, no test file) | yes - exit 0 is the claim |
| C4 | `estrutura.test.cjs` `npm test compila e roda os testes` | no - matches the text of `scripts.test`; a broken test script with the same text passes |
| C5 | `estrutura.test.cjs` `ci.yml roda ci, lint, test e build com a node-version do publish` | no - `includes('npm ci')` also matches a comment or a disabled step; `nodeVersion` reads only the first `node-version` |
| C6 | `campos.test.cjs` `v1 patient get envia subscriber_id e PatientId` | yes |
| C7 | `campos.test.cjs` `v1 appointment create envia Procedures em texto` | yes |
| C8 | `campos.test.cjs` `v1 mantém name e type de todo parâmetro da 1.1.2` | no - compares only `name` and `type`; skips options without `type` and the values inside `fixedCollection` (Product `productsUi` is not in the fixture); `required`, `default` and option values can change |
| C9 | `campos.test.cjs` `v1 não valida o horário` | yes |
| C10 | `campos.test.cjs` `v2 expõe defaultVersion 2, procedimentos em lista e sexo em opções` | yes |
| C11 | `campos.test.cjs` `v2 junta procedimentos com vírgula e omite quando vazio` | yes - only `[]` as empty; names with a comma or spaces not covered |
| C12 | `campos.test.cjs` `getProcedures lista e ordena por nome` | yes - the fixture always has `id`, so the drop of items without `id` is not covered |
| C13 | `campos.test.cjs` `v2 valida horário HH:mm antes da requisição` | no - 6 values only on From Time of Create; To Time of Create untested; empty required time untested (it passes, see Findings) |
| C14 | `campos.test.cjs` `v2 valida ID obrigatório antes da requisição` | no - `assert.match(erro.description, /Get Many\|Get/)` accepts any text with "Get"; `Object.values(enviado).includes('x1')` accepts any key; only string IDs |
| C15 | `campos.test.cjs` `campos de ID têm placeholder e descrição de origem` | yes |
| C16 | `campos.test.cjs` `requisição leva timeout de 30000 na v1` and `na v2` | yes - one operation; all calls share `clinicorpApiRequest`, so it holds |
| C17 | `campos.test.cjs` `timeout vira NodeApiError ou item de erro` | yes |
| C18 | `campos.test.cjs` `loadOptions e teste de credencial levam timeout` | yes |
| C19 | `publicacao.test.cjs` `metadados da 1.2.0 e changelog` | yes - the changelog check is the heading only, not the items the claim lists |
| C20 | `publicacao.test.cjs` `README segue o padrão completo` | yes |
| C21 | `publicacao.test.cjs` `publish.yml publica por stage com RELEASE_MODE` | no - text `includes`/regex on the YAML; the same text in a comment or in a skipped step passes |
| C22 | n/a - ação do dono (`walk`) | n/a - ação do dono |

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| v2 breaks on a numeric ID: `readRequiredId` calls `.trim()` on a number, so an expression like `{{ $json.id }}` with a numeric Clinicorp ID (the placeholders are `4817203`) raises `TypeError`; v1 accepted it | Probe on `dist`: `cancelId` `12345` and `0` on `typeVersion` 2 give `NodeOperationError: ....trim is not a function`; `'0'` passes; `nodes/Clinicorp/helpers/guided.ts` `(value ?? '').trim()` | in `readRequiredId` use `String(value ?? '').trim()` and add a test with `cancelId: 12345` that expects `'12345'` in the request | |
| v2 accepts an empty required time: Create sends `fromTime: ''` and `toTime: ''` with no error, although the plan says a value that does not match `HH:mm` is an error before the request | Probe: `typeVersion` 2, `fromTime: ''` returns a request with `"fromTime":""`; `checkTime` returns early on `!value` (`guided.ts`) | for Create, where both times are `required`, make `checkTime` refuse empty; keep the early return only for the optional Online Scheduling fields; add `''` to the C13 cases | |
| Tab characters in `Product.ts` came with the lint fix: the Lot description is now `'Lot<TAB>/<TAB>batch number of the product (lote)'`, and four `required:<TAB>true` lines have a tab and wrong indent; this changes a v1 description with no plan item | `nodes/Clinicorp/actions/product/Product.ts:107` (`cat -A` shows `Lot^I/^Ibatch`); `git show 4d74e2e:...Product.ts:140` has plain spaces | restore `'Lot / batch number of the product (lote)'` and fix the `required: true` indent | |
| C8 does not guard the nested fields of `productsUi` (fixedCollection): the diff reordered all 12 fields and moved `required` with no test able to fail if a name, type or `required` had changed | `test/fixtures/params-1.1.2.json` has only `product/createOrder\|productsUi\|fixedCollection`; `campos.test.cjs` skips options without `type` and compares no `required` | add the nested `values` (name, type, required) of every `fixedCollection` and the `required` flag to the fixture and to the C8 key | |
| Procedure names are joined by `, ` with no escape and no trim: `['A, B','C']` sends `A, B, C`, `[' ']` sends `Procedures: ' '`, `'  A  '` keeps its spaces; also `toOptions` drops a procedure that has no `id` though the value is the name, and two procedures with the same name show twice | Probe: `['A, B','C']` -> `"A, B, C"`; `[' ']` -> `" "`; `getProcedures` on `[{ProcedureName:'Z'}]` -> `[]`; same-name pair -> two equal options; `loadOptions.ts` `toOptions` filter on `value` | in `normalizeProcedures` trim each name and drop empty ones; in `getProcedures` do not require `id` and dedupe by name; record the comma case as a known limit of the string format | |
| Assertions looser than the criterion: C14 `/Get Many\|Get/` and `includes('x1')`; C13 misses To Time of Create and `''`; C4, C5 and C21 match text, not behavior | see the `## Checks` rows; `campos.test.cjs` C14 block, `estrutura.test.cjs` C4 and C5, `publicacao.test.cjs` C21 | assert the exact origin text per operation and the key that carries the ID; add the missing C13 cases; for C5 and C21 parse the YAML steps instead of `includes` | |
| Appointment > Get has a `required` ID (`getId`) with no placeholder, no origin text and no v2 empty check, unlike the other required appointment IDs; it sends `id: ''` (it also takes `getCodeLink`, so the ID may be optional in practice) | `Appointment.ts:446-452` and `:832`; probe: `appointment get` v2 with empty `getId` and `getCodeLink` returns a request with `id: ''` | add placeholder and origin text to `getId` (S3.8) and refuse when both are empty, or record in the plan why Get is left out | |
