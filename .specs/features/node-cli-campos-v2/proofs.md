# node-cli-campos-v2 proofs

**HEAD**: 8b783be
**Tree**: clean
**Shell**: /bin/sh
**Result**: 25 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run unit / ✔ build gera node, credencial e ícones` | pass |
| C2 | `run unit / ✔ package.json segue o padrão do node-cli` | pass |
| C3 | `npm run lint` | pass |
| C4 | `run unit / ✔ npm test compila e roda os testes` | pass |
| C5 | `run unit / ✔ ci.yml roda ci, lint, test e build com a node-version do publish` | pass |
| C6 | `run unit / ✔ v1 patient get envia subscriber_id e PatientId` | pass |
| C7 | `run unit / ✔ v1 appointment create envia Procedures em texto` | pass |
| C8 | `run unit / ✔ v1 mantém name e type de todo parâmetro da 1.1.2` | pass |
| C9 | `run unit / ✔ v1 não valida o horário` | pass |
| C10 | `run unit / ✔ v2 expõe defaultVersion 2, procedimentos em lista e sexo em opções` | pass |
| C11 | `run unit / ✔ v2 junta procedimentos com vírgula e omite quando vazio` | pass |
| C12 | `run unit / ✔ getProcedures lista e ordena por nome` | pass |
| C13 | `run unit / ✔ v2 valida horário HH:mm antes da requisição` | pass |
| C14 | `run unit / ✔ v2 valida ID obrigatório antes da requisição` | pass |
| C15 | `run unit / ✔ campos de ID têm placeholder e descrição de origem` | pass |
| C16 | `run unit / ✔ requisição leva timeout de 30000` | pass |
| C17 | `run unit / ✔ timeout vira NodeApiError ou item de erro` | pass |
| C18 | `run unit / ✔ loadOptions e teste de credencial levam timeout` | pass |
| C19 | `run unit / ✔ metadados da 1.2.0 e changelog` | pass |
| C20 | `run unit / ✔ README segue o padrão completo` | pass |
| C21 | `run unit / ✔ publish.yml publica por stage com RELEASE_MODE` | pass |
| C22 | `walk - o dono aprova a versão com 2FA no npmjs.com e roda npm view n8n-nodes-clinicorp version` | pass (Walked) |
| Build | `npm run build` | pass |
| Build | `npm run lint` | pass |
| Build | `npx tsc --noEmit` | pass |

## Output

`Run unit` - exit 0

```
  ✔ ci.yml roda ci, lint, test e build com a node-version do publish (1.210351ms)
✔ S1 toolchain do node-cli (6.291287ms)
▶ S5 lançamento 1.2.0
  ✔ metadados da 1.2.0 e changelog (1.378968ms)
  ✔ README segue o padrão completo (0.553098ms)
  ✔ publish.yml publica por stage com RELEASE_MODE (0.295578ms)
✔ S5 lançamento 1.2.0 (6.848438ms)
ℹ tests 30
ℹ suites 7
ℹ pass 30
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 480.699939
```

`npm run lint` - exit 0

```
> n8n-nodes-clinicorp@1.2.0 lint
> n8n-node lint

┌   n8n-node lint  v0.55.5
```
