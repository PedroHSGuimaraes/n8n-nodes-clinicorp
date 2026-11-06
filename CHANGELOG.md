# Changelog

## 1.2.0

- **Node versão 2 com campos guiados.** Em node novo (`defaultVersion` 2): os procedimentos de Appointment > Create viram uma lista da conta, o sexo do paciente vira uma lista (`F` e `M`) e a cor da categoria vira um seletor de cor. O horário (`HH:mm`) e os IDs obrigatórios de agendamento e orçamento são validados antes da requisição, com a dica de onde achar o ID.
- **Versão 1 intacta.** Workflows salvos continuam na versão 1, com o mesmo nome e tipo de todo parâmetro da 1.1.2.
- **Timeout de 30 s** em toda chamada ao Clinicorp, nos dropdowns e no teste de credencial.
- **Toolchain.** Migração para o `@n8n/node-cli` 0.55.5 (`n8n-node build` e `n8n-node lint`, sem gulp), `n8n-workflow` `^2.46.5` e lint oficial sem erros (eram 52).
- **Publicação.** O `publish.yml` usa `npm stage publish` com provenance, e a versão espera a aprovação do dono no npmjs.com. O CI roda lint, testes e build.
- **Documentação.** README completo, com selo e seção Apoie o projeto, exemplos, publicação e `funding` no `package.json`.

## 1.1.2

- Atualização das GitHub Actions e do Node do CI.
