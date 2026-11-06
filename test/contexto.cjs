/**
 * Contexto falso de execução usado pelos testes do node Clinicorp.
 *
 * Ele imita o que o n8n entrega ao `execute` e ao `loadOptions`: parâmetros por nome,
 * a versão do node, a credencial e o helper de HTTP. O helper só grava a requisição que
 * o node montou, então os testes comparam método, rota, corpo e timeout sem rede.
 */
function criarContexto({ typeVersion = 1, parametros = {}, resposta = {}, continuarComFalha = false } = {}) {
	const requisicoes = [];
	const contexto = {
		requisicoes,
		getNode: () => ({ name: 'Clinicorp', type: 'clinicorp', typeVersion }),
		getInputData: () => [{ json: {} }],
		getNodeParameter: (nome, _indice, valorPadrao) =>
			Object.prototype.hasOwnProperty.call(parametros, nome) ? parametros[nome] : valorPadrao,
		getCredentials: async () => ({ apiUser: 'u', apiToken: 't', subscriberId: 'sub-1' }),
		continueOnFail: () => continuarComFalha,
		helpers: {
			httpRequestWithAuthentication: async (_credencial, opcoes) => {
				requisicoes.push(opcoes);
				// Uma função de resposta deixa o teste simular falha ou dado por rota.
				if (typeof resposta === 'function') return resposta(opcoes);
				return resposta;
			},
			returnJsonArray: (itens) => (Array.isArray(itens) ? itens : [itens]).map((json) => ({ json })),
			constructExecutionMetaData: (dados) => dados,
		},
	};
	return contexto;
}

module.exports = { criarContexto };
