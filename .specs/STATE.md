# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | O pacote usa o `@n8n/node-cli` 0.55.5 para build e lint (`n8n-node build`, `n8n-node lint`, `n8n.strict: true`), sem gulp, sem ESLint próprio e sem `dependencies` de runtime | A guideline de verificação do n8n manda usar a ferramenta `n8n-node`. Menu: "Migrar para node-cli" (Jev 0,96) | active | 2026-11-06 |
| AD-002 | Mudança de formato de parâmetro entra como versão leve do node (`version: [1, 2]`, `defaultVersion` 2, `@version` em `displayOptions`); a versão 1 mantém nome e tipo de todo parâmetro | Workflows salvos não podem quebrar. Menu: "Nova versão do node" (Jev 0,83) | active | 2026-11-06 |
| AD-003 | A entrega é branch, Pull Request, merge na `main` e tag `vX.Y.Z`, que publica no npm pelo `publish.yml` com provenance | Menu: "PR e publicar" | active | 2026-11-06 |
| AD-004 | A publicação usa `npx -y npm@12.2.2 stage publish --provenance --access public`: a versão fica em espera e o dono a aprova com 2FA na aba Staged Packages do npmjs.com | O dono manteve o token npm "stage only"; com ele `npm publish` falha com `E_STAGE_REQUIRED`. `npm stage` só existe no npm 12. Decisão do dono, 06/11/2026 | active | 2026-11-06 |
| AD-005 | A devDependency `n8n-workflow` sobe de `^2.16.0` para `^2.46.5` com o lock em 2.46.x ou mais nova; o `peerDependencies` continua `*` | A tag `latest` do npm está parada em 2.16.0; a `stable` 2.46.5 é a do n8n 2.46.6, e o audit cai de 5 para 3 CVEs altas. Decisão do dono, 06/11/2026 | active | 2026-11-06 |
| AD-006 | O README sai completo no padrão do RD Station CRM e o `package.json` leva `funding` `{"type":"individual","url":"https://buymeacoffee.com/qTny0AzFXS"}` | Decisão do dono, 06/11/2026 | active | 2026-11-06 |
| AD-007 | O nome `n8n-nodes-clinicorp` não muda | `npm view` em 06/11/2026: o pacote existente é este mesmo (1.1.2); `n8nnodesclinicorp` devolve 404, então nenhum nome parecido sem pontuação bloqueia o stage (E400). O único outro pacote com "clinicorp" na busca é `n8n-nodes-digisac`, de outro serviço | active | 2026-11-06 |
| AD-008 | Os campos de ID de paciente, agendamento e orçamento ficam em texto, com dica de onde achar o ID e validação; nenhum vira Resource Locator `From List` | A doc oficial da Clinicorp (`sistema.clinicorp.com/api-docs`) só documenta `patient/get` com `patient_id` obrigatório, sem listagem nem busca de paciente; `appointment/list` exige faixa de datas; `estimates/list` não documenta filtro nem paginação. Sem rota confirmada não há lista. Menu: "manter texto com validação" (Jev 0,89, contra Resource Locator só By ID 0,11 e From List 0,00) | active | 2026-11-06 |
