# n8n-nodes-clinicorp

Node community do [n8n](https://n8n.io/) para integrar seus fluxos com o **[Clinicorp](https://www.clinicorp.com/)** — o sistema de gestão para clínicas e consultórios (odontologia e saúde).

Com um **único node** você consulta e cria dados no Clinicorp: orçamentos, pacientes, agendamentos, financeiro, pagamentos, vendas, procedimentos, profissionais, clínicas, leads de CRM, analytics, metas e mais. Autenticação simples por **usuário + token da API** (HTTP Basic), e o node é **usável como Tool de Agente de IA**.

[n8n](https://n8n.io/) é uma plataforma de automação de fluxos com [licença fair-code](https://docs.n8n.io/reference/license/).

[Instalação](#-instalação) · [Credenciais](#-credenciais) · [Nós e Operações](#-nós-e-operações) · [Subscriber ID](#-subscriber-id-id-do-assinante) · [Tool de IA](#-usar-como-tool-de-agente-de-ia) · [Desenvolvimento](#️-desenvolvimento) · [Versões](#-versões)

---

## 🚀 Funcionalidades

- **1 node unificado** — `Clinicorp` com seletor **Recurso → Operação**. 17 recursos e ~49 operações cobrindo toda a API pública do Clinicorp.
- **Autenticação simples** — credencial única com **Usuário API** e **Token API** (HTTP Basic). Inclui um **teste embutido** que valida as credenciais antes de rodar o fluxo.
- **Subscriber ID reaproveitável** — informe o **id do Assinante** uma vez na credencial e ele é usado automaticamente em toda operação que precisa dele (ou sobrescreva por node). Veja [Subscriber ID](#-subscriber-id-id-do-assinante).
- **Dropdowns dinâmicos** — clínicas, profissionais, status de agendamento, categorias, especialidades e procedimentos são carregados direto da sua conta: você escolhe pelo nome, sem copiar IDs.
- **Datas amigáveis** — campos de data usam o seletor `dateTime` do n8n e são convertidos para o formato que o Clinicorp espera (`YYYY-MM-DD` ou `YYYYMMDD`) automaticamente.
- **Usável como Tool de IA** — o node tem `usableAsTool: true`, então um **AI Agent** do n8n pode chamar qualquer operação (buscar orçamentos, criar paciente, agendar, enviar lead…) preenchendo os parâmetros sozinho via `$fromAI()`. Todas as descrições de operações e campos foram escritas para o LLM entender. Veja [Usar como Tool de Agente de IA](#-usar-como-tool-de-agente-de-ia).
- **Zero dependências de runtime** — usa o `httpRequestWithAuthentication` do próprio n8n. Passa no ESLint `@n8n/eslint-plugin-community-nodes` (0 erros) e é publicado no npm **com provenance**.

## 📦 Instalação

Siga o [guia de community nodes](https://docs.n8n.io/integrations/community-nodes/installation/) do n8n.

No n8n, vá em **Settings → Community Nodes → Install** e digite:

```
n8n-nodes-clinicorp
```

> Requer uma instância n8n com `n8nNodesApiVersion` 1.

## 🔑 Credenciais

O node usa **uma credencial**: `Clinicorp API`. A API do Clinicorp autentica por **HTTP Basic**, onde:

- **API User (Username)** = o seu **Usuário API**.
- **API Token (Password)** = o seu **Token API**.

Como encontrar essas informações no Clinicorp:

1. Faça login no sistema.
2. Clique em **Gerenciar Assinatura**.
3. Clique em **Acesso Externo e Integrações**.
4. Em **Integrações**, copie o **Usuário API** (username) e o **Token API** (password).

No n8n, crie uma credencial **Clinicorp API**, cole o usuário e o token e (opcionalmente) preencha o **Default Subscriber ID**. A credencial tem um **teste embutido** que chama `GET /professional/list_all_professionals`, então dá pra validar antes de rodar o fluxo.

| Item | Valor |
| --- | --- |
| Base da API | `https://api.clinicorp.com/rest/v1` |
| Autenticação | HTTP Basic (usuário API : token API) |
| Documentação | https://sistema.clinicorp.com/api-docs/ |

## 🆔 Subscriber ID (id do Assinante)

Quase toda operação do Clinicorp precisa do **`subscriber_id`** (o id do Assinante/conta). Para não repetir isso em cada node:

- Preencha o **Default Subscriber ID** na **credencial** — ele passa a ser usado automaticamente sempre que o campo do node estiver vazio.
- Ou preencha o campo **Subscriber ID** no próprio node quando quiser sobrescrever (ex.: alternar entre contas).

Se nenhum dos dois estiver preenchido, as operações que exigem `subscriber_id` retornam um erro claro pedindo para configurá-lo.

## 🧩 Nós e Operações

O pacote traz **um node de ação** (`Clinicorp`) com seletor **Recurso → Operação**.

| Recurso | Operações |
| --- | --- |
| **Estimate** (Orçamento) | Get, Get Many |
| **Patient** (Paciente) | Create, Get, Get Birthdays, Get Estimate Totals, Get Many Appointments |
| **Appointment** (Agendamento) | Cancel, Change Status, Confirm, Create, Create Online Scheduling, Get, Get Available Days, Get Available Times, Get Info, Get Many, Get Many Categories, Get Occupation, Get Statuses |
| **Financial** (Financeiro) | Get Average Installments, Get Cash Flow, Get Invoices, Get Payments, Get Receipts, Get Summary |
| **Payment** (Pagamento) | Get Health Insurance Claims, Get Many |
| **Sales** (Vendas) | Get Estimates And Conversion, Get Revenue By Specialty |
| **Analytics** | Get Results |
| **Operational** (Operacional) | Get Miss Goals, Get Sales Goals |
| **Clinic** (Clínica) | Get Available Times, Get Chairs, Get Many |
| **Professional** (Profissional) | Get Many |
| **Procedure** (Procedimento) | Get Many, Get Many Specialties |
| **CRM** | Add Lead, Get Active Campaigns |
| **Group** (Franquia) | Get Clinics Info, Get Franchise Units |
| **User** (Usuário) | Get Many |
| **Product** (Produto) | Create Order |
| **Migration** (Migração) | Create From Connection, Create From File, Get Upload URL |
| **File** (Arquivo) | Upload |

### Exemplo — listar orçamentos do mês

1. **Clinicorp** → Recurso **Estimate**, Operação **Get Many**.
2. Defina **From Date** e **To Date** (o node envia como `YYYY-MM-DD`).
3. Opcional: escolha a **Clinic** pelo dropdown para filtrar uma clínica específica.
4. O `subscriber_id` vem automaticamente da credencial.

### Exemplo — criar um paciente e um lead de CRM

1. **Clinicorp** → Recurso **Patient**, Operação **Create** (informe o **Name** e os campos adicionais).
2. **Clinicorp** → Recurso **CRM**, Operação **Add Lead**, usando o nome/e-mail do paciente.

## 🤖 Usar como Tool de Agente de IA

O node `Clinicorp` é **usável como tool** por nós de **AI Agent** do n8n (Tools Agent). Isso deixa o modelo **consultar e agir no Clinicorp sozinho** — por exemplo: *"quantos orçamentos foram criados este mês e qual a taxa de conversão?"* ou *"agende a Maria para amanhã às 14h com o Dr. João"*.

### Como ligar (2 passos)

1. **No servidor n8n**, habilite o uso de community nodes como tools (por segurança, vem **desligado por padrão**). Defina a variável de ambiente:

   ```bash
   N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
   ```

   | Instalação | Onde definir |
   | --- | --- |
   | **Docker / docker-compose** | Adicione em `environment:` do serviço n8n (ou no `.env`) e recrie o container (`docker compose up -d`). |
   | **npm / npx** | Exporte antes de subir: `export N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true && n8n start`. |
   | **n8n Cloud** | Já habilitado nos planos que suportam community nodes. |

   > Sem essa variável o node **não aparece** na lista de tools do AI Agent — é a causa nº 1 de "não acho o node como tool".

2. **No workflow**, adicione um node **AI Agent**, conecte um **Chat Model** e, no conector **Tool**, adicione o **Clinicorp**. Escolha o **Recurso** e a **Operação** que o agente pode usar (ex.: Estimate → Get Many). Uma tool por operação é a prática recomendada.

### Deixe o modelo preencher os campos (`$fromAI`)

Em cada campo do node em modo tool aparece o botão **"Let the model define this"**, que usa a expressão:

```
{{ $fromAI('from', 'Data inicial do período no formato YYYY-MM-DD', 'string') }}
```

- Assinatura: `$fromAI(key, description?, type?, defaultValue?)` — `key` de 1–64 caracteres (`[a-zA-Z0-9_-]`); `type` = `string` | `number` | `boolean` | `json`.
- Você pode **misturar**: fixar alguns campos (ex.: deixar o **Subscriber ID** vindo da credencial) e deixar o modelo preencher outros (datas, filtros, nome do paciente).
- As **descrições de cada operação e campo** deste node foram escritas para o LLM entender o que cada uma faz e como preencher — quanto mais específico o seu prompt/System Message do agente, melhor o resultado.

### Boas práticas

- **Restrinja o escopo:** exponha só as operações que o agente precisa (ex.: só *Get Many* de Estimate e Appointment), em vez de liberar tudo.
- **Credencial dedicada** com o **Default Subscriber ID** já configurado, para o agente não precisar adivinhar o id do Assinante.
- **n8n atualizado:** versões antigas tinham um bug em que a tool de community node retornava resposta vazia para o agente ([n8n#26202](https://github.com/n8n-io/n8n/issues/26202)); já corrigido.

### Referências

- [Tools Agent — n8n Docs](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent)
- [Let AI specify tool parameters (`$fromAI`) — n8n Docs](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/)
- [Variáveis de ambiente de nodes — n8n Docs](https://docs.n8n.io/hosting/configuration/environment-variables/nodes/)

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Compilar (tsc + cópia de ícones via gulp)
npm run build

# Modo watch
npm run dev

# Lint (ESLint + plugin de community nodes)
npm run lint
npm run lintfix

# Formatar
npm run format
```

Estrutura resumida:

```
n8n-nodes-clinicorp/
├── credentials/
│   └── ClinicorpApi.credentials.ts     # HTTP Basic (usuário API + token API)
├── nodes/
│   └── Clinicorp/
│       ├── Clinicorp.node.ts           # node de ação (Recurso → Operação)
│       ├── actions/                    # um arquivo por recurso (operações + campos)
│       ├── methods/                    # loadOptions (dropdowns dinâmicos)
│       ├── helpers/                    # formatação de datas / bodies
│       └── transport/                  # cliente HTTP + resolução do Subscriber ID
└── dist/                               # saída compilada (publicada)
```

## ✅ Compatibilidade

- Requer n8n com `n8nNodesApiVersion` 1.
- Base da API: `https://api.clinicorp.com/rest/v1`.

## 📚 Recursos

- [Documentação de community nodes do n8n](https://docs.n8n.io/integrations/community-nodes/)
- [Documentação da API do Clinicorp](https://sistema.clinicorp.com/api-docs/)

## 📈 Versões

- **1.0.2** — **Menos alucinação da IA.** Passada de descrições focada em uso como Tool de Agente: as operações de **agenda** (ver e marcar) ganharam desambiguação explícita — *Appointment → Create* (agenda interna) vs *Create Online Scheduling* (solicitação pelo link público), e *Appointment → Get Available Times* (por Code Link) vs *Clinic → Get Available Times* (por profissional) — além do encadeamento recomendado (consultar disponibilidade → criar com o horário exato). Enum de convênio passa a listar os valores válidos (`ALL`, `OPEN`, `DISPUTE`, `REJECT`, `PARTIAL_PAID`, `PAID`); telefone, CPF, cor de categoria e horários ganharam formato + exemplo; `Board Name` do CRM instrui a copiar o nome exato de *Get Active Campaigns*; e a descrição do node passa a declarar as convenções (datas `YYYY-MM-DD`, horas `HH:mm`, IDs sempre vindos da operação de listagem, Subscriber ID vindo da credencial).
- **1.0.1** — Correção: o node não aparecia na busca de ações do editor (embora instalasse e funcionasse ao colar). Causa: o pacote publicava um arquivo codex (`*.node.json`) que fazia o n8n categorizar o node fora da busca normal. O codex deixou de ser publicado (mesma abordagem do node RD Station). O node continua utilizável como Tool de IA (`usableAsTool` fica na descrição do node, não no codex).
- **1.0.0** — Primeira versão. Node único `Clinicorp` (Recurso → Operação) com 17 recursos e ~49 operações; credencial HTTP Basic com teste embutido; Subscriber ID reaproveitável pela credencial; dropdowns dinâmicos (clínicas, profissionais, status, categorias, especialidades, procedimentos); `usableAsTool: true` com descrições otimizadas para IA; publicação no npm com provenance via GitHub Actions.

## 🆘 Suporte

Se algo não funcionar:

1. Confirme se o **Usuário API** e o **Token API** estão corretos (Gerenciar Assinatura → Acesso Externo e Integrações → Integrações).
2. Confirme se o **Subscriber ID** está preenchido (na credencial ou no node).
3. Verifique se a versão do n8n é compatível.
4. Consulte os logs do n8n para detalhes do erro.
5. Abra uma [issue no GitHub](https://github.com/PedroHSGuimaraes/n8n-nodes-clinicorp/issues).

## 📄 Licença

[MIT](LICENSE.md)
