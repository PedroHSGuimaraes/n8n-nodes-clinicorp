/**
 * Testes dos campos do node Clinicorp: versão 1 intacta (S2), campos guiados da versão 2 (S3)
 * e timeout em toda chamada (S4). Chamam o `execute` do `dist` com um contexto falso e
 * conferem a requisição HTTP que o node montaria.
 */
const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { Clinicorp } = require('../dist/nodes/Clinicorp/Clinicorp.node');
const { ClinicorpApi } = require('../dist/credentials/ClinicorpApi.credentials');
const { loadOptions } = require('../dist/nodes/Clinicorp/methods/loadOptions');
const { criarContexto } = require('./contexto.cjs');
const chavesDaVersao1 = require('./fixtures/params-1.1.2.json');

// Roda o `execute` do node para um recurso e uma operação e devolve o contexto com as requisições.
async function executar({ recurso, operacao, parametros, typeVersion, resposta, continuarComFalha }) {
	const contexto = criarContexto({
		typeVersion,
		parametros: { resource: recurso, operation: operacao, ...parametros },
		resposta,
		continuarComFalha,
	});
	const saida = await new Clinicorp().execute.call(contexto);
	return { contexto, saida };
}

// Lê a condição de versão de um parâmetro (`@version` em displayOptions.show).
const condicaoDeVersao = (propriedade) => ((propriedade.displayOptions || {}).show || {})['@version'];
// Um parâmetro vale para a versão 1 quando não tem condição ou quando a lista inclui 1.
const valeParaVersao1 = (propriedade) => {
	const condicao = condicaoDeVersao(propriedade);
	return !condicao || condicao.includes(1);
};
const valeParaVersao2 = (propriedade) => {
	const condicao = condicaoDeVersao(propriedade);
	return !condicao || condicao.some((c) => typeof c === 'object' && c._cnd && c._cnd.gte === 2);
};
const contextoDe = (propriedade) => {
	const mostrar = (propriedade.displayOptions || {}).show || {};
	return [mostrar.resource, mostrar.operation].map((v) => (v ? v.join(',') : '*')).join('/');
};
// Acha o `additionalFields` de uma operação para a versão pedida.
function camposAdicionais(recurso, operacao, versao) {
	const filtro = versao === 1 ? valeParaVersao1 : valeParaVersao2;
	return new Clinicorp().description.properties.find(
		(p) =>
			p.name === 'additionalFields' &&
			contextoDe(p) === `${recurso}/${operacao}` &&
			filtro(p) &&
			(versao === 1 ? !condicaoDeVersao(p) || condicaoDeVersao(p).includes(1) : !!condicaoDeVersao(p)),
	);
}

const corpoDeCriarAgendamento = (extras) => ({
	patientName: 'Ana',
	createDate: '2026-11-10T00:00:00.000Z',
	fromTime: '14:00',
	toTime: '14:30',
	createClinicId: 'c1',
	createDentistId: 'd1',
	additionalFields: extras,
});

describe('S2 versão 1 continua igual', () => {
	it('v1 patient get envia subscriber_id e PatientId', async () => {
		const { contexto } = await executar({
			recurso: 'patient',
			operacao: 'get',
			parametros: { patientId: 'p1', additionalFilters: {} },
			typeVersion: 1,
		});
		const req = contexto.requisicoes[0];
		assert.equal(req.method, 'GET');
		assert.equal(req.baseURL, 'https://api.clinicorp.com/rest/v1');
		assert.equal(req.url, '/patient/get');
		assert.deepEqual(req.qs, { subscriber_id: 'sub-1', PatientId: 'p1' });
	});

	it('v1 appointment create envia Procedures em texto', async () => {
		const { contexto } = await executar({
			recurso: 'appointment',
			operacao: 'create',
			parametros: corpoDeCriarAgendamento({ procedures: 'Limpeza, Restauração' }),
			typeVersion: 1,
		});
		const req = contexto.requisicoes[0];
		assert.equal(req.url, '/appointment/create_appointment_by_api');
		assert.equal(req.body.Procedures, 'Limpeza, Restauração');
	});

	it('v1 mantém name e type de todo parâmetro da 1.1.2', () => {
		// A fixture guarda "contexto|caminho|tipo|req" de cada parâmetro, opção de coleção e campo
		// de fixedCollection da 1.1.2. A mesma regra monta as chaves da versão 1 atual.
		const atuais = new Set();
		const descer = (contexto, caminho, nos) => {
			for (const no of nos) {
				if (!no.name || !no.type) continue;
				const atual = caminho ? `${caminho}.${no.name}` : no.name;
				atuais.add([contexto, atual, no.type, no.required ? 'req' : 'opt'].join('|'));
				for (const opcao of no.options || []) {
					if (opcao.values) descer(contexto, `${atual}.${opcao.name}`, opcao.values);
					else if (opcao.name && opcao.type) descer(contexto, atual, [opcao]);
				}
			}
		};
		for (const p of new Clinicorp().description.properties.filter(valeParaVersao1)) {
			descer(contextoDe(p), '', [p]);
		}
		const faltando = chavesDaVersao1.filter((chave) => !atuais.has(chave));
		assert.deepEqual(faltando, []);
	});

	it('v1 não valida o horário', async () => {
		const { contexto } = await executar({
			recurso: 'appointment',
			operacao: 'create',
			parametros: { ...corpoDeCriarAgendamento({}), fromTime: '9h' },
			typeVersion: 1,
		});
		assert.equal(contexto.requisicoes[0].body.fromTime, '9h');
	});
});

describe('S3 campos guiados na versão 2', () => {
	it('v2 expõe defaultVersion 2, procedimentos em lista e sexo em opções', () => {
		const descricao = new Clinicorp().description;
		assert.deepEqual(descricao.version, [1, 2]);
		assert.equal(descricao.defaultVersion, 2);

		const agendamento = camposAdicionais('appointment', 'create', 2);
		const procedimentos = agendamento.options.find((o) => o.name === 'procedures');
		assert.equal(procedimentos.type, 'multiOptions');
		assert.equal(procedimentos.typeOptions.loadOptionsMethod, 'getProcedures');
		// A cor da categoria vira seletor de cor na v2 (na v1 continua texto, ver teste da v1).
		assert.equal(agendamento.options.find((o) => o.name === 'categoryColor').type, 'color');

		const paciente = camposAdicionais('patient', 'create', 2);
		const sexo = paciente.options.find((o) => o.name === 'sex');
		assert.equal(sexo.type, 'options');
		assert.deepEqual(sexo.options.map((o) => o.value).sort(), ['F', 'M']);
	});

	it('v2 junta procedimentos com vírgula e omite quando vazio', async () => {
		const dois = await executar({
			recurso: 'appointment',
			operacao: 'create',
			parametros: corpoDeCriarAgendamento({ procedures: ['Limpeza', 'Restauração'] }),
			typeVersion: 2,
		});
		assert.equal(dois.contexto.requisicoes[0].body.Procedures, 'Limpeza, Restauração');

		// Espaço nas pontas sai e item vazio some; lista só de vazios some do corpo.
		const sujos = await executar({
			recurso: 'appointment',
			operacao: 'create',
			parametros: corpoDeCriarAgendamento({ procedures: ['  Limpeza  ', ' ', 'Restauração'] }),
			typeVersion: 2,
		});
		assert.equal(sujos.contexto.requisicoes[0].body.Procedures, 'Limpeza, Restauração');
		const soVazios = await executar({
			recurso: 'appointment',
			operacao: 'create',
			parametros: corpoDeCriarAgendamento({ procedures: [' '] }),
			typeVersion: 2,
		});
		assert.equal('Procedures' in soVazios.contexto.requisicoes[0].body, false);

		const nenhum = await executar({
			recurso: 'appointment',
			operacao: 'create',
			parametros: corpoDeCriarAgendamento({ procedures: [] }),
			typeVersion: 2,
		});
		assert.equal('Procedures' in nenhum.contexto.requisicoes[0].body, false);
	});

	it('getProcedures lista e ordena por nome', async () => {
		const contexto = criarContexto({
			resposta: [{ id: 2, ProcedureName: 'Restauração' }, { id: 1, ProcedureName: 'Limpeza' }],
		});
		const opcoes = await loadOptions.getProcedures.call(contexto);
		assert.equal(contexto.requisicoes.length, 1);
		assert.equal(contexto.requisicoes[0].url, '/procedures/list');
		assert.deepEqual(opcoes, [
			{ name: 'Limpeza', value: 'Limpeza' },
			{ name: 'Restauração', value: 'Restauração' },
		]);
	});

	it('getProcedures aceita item sem id e não repete nome', async () => {
		const contexto = criarContexto({
			resposta: [{ ProcedureName: 'Z' }, { id: 7, ProcedureName: 'A' }, { id: 8, ProcedureName: 'A' }],
		});
		assert.deepEqual(await loadOptions.getProcedures.call(contexto), [
			{ name: 'A', value: 'A' },
			{ name: 'Z', value: 'Z' },
		]);
	});

	describe('v2 valida horário HH:mm antes da requisição', () => {
		for (const [horario, valido] of [
			['14:00', true],
			['00:00', true],
			['23:59', true],
			['24:00', false],
			['9h', false],
			['9:5', false],
		]) {
			it(`${horario} ${valido ? 'passa' : 'é recusado'}`, async () => {
				const chamada = executar({
					recurso: 'appointment',
					operacao: 'create',
					parametros: { ...corpoDeCriarAgendamento({}), fromTime: horario },
					typeVersion: 2,
				});
				if (valido) {
					const { contexto } = await chamada;
					assert.equal(contexto.requisicoes[0].body.fromTime, horario);
				} else {
					await assert.rejects(chamada, (erro) => {
						assert.equal(
							erro.message,
							"The 'From Time' parameter must use the 24-hour format HH:mm [item 0]",
						);
						return true;
					});
				}
			});
		}

		it('Create recusa To Time inválido e horário obrigatório vazio', async () => {
			for (const [campo, valor, rotulo] of [
				['toTime', '25:00', 'To Time'],
				['toTime', '', 'To Time'],
				['fromTime', '', 'From Time'],
			]) {
				await assert.rejects(
					executar({
						recurso: 'appointment',
						operacao: 'create',
						parametros: { ...corpoDeCriarAgendamento({}), [campo]: valor },
						typeVersion: 2,
					}),
					new RegExp(`'${rotulo}' parameter must use the 24-hour format HH:mm \\[item 0\\]`),
				);
			}
		});

		it('Create Online Scheduling também valida To Time', async () => {
			const chamada = executar({
				recurso: 'appointment',
				operacao: 'createOnlineScheduling',
				parametros: {
					onlinePatientName: 'Ana',
					onlineDate: '2026-11-10T00:00:00.000Z',
					additionalFields: { toTime: '25:00' },
				},
				typeVersion: 2,
			});
			await assert.rejects(chamada, /'To Time' parameter must use the 24-hour format HH:mm \[item 0\]/);
		});
	});

	describe('v2 valida ID obrigatório antes da requisição', () => {
		// recurso, operação, parâmetro, rótulo, origem dita ao usuário, rota e onde o ID viaja.
		const casos = [
			['appointment', 'cancel', 'cancelId', 'Appointment ID', 'Appointment > Get Many', '/appointment/cancel_appointment', 'body.id'],
			['appointment', 'confirm', 'confirmId', 'Appointment ID', 'Appointment > Get Many', '/appointment/confirm_appointment', 'body.id'],
			['appointment', 'changeStatus', 'changeStatusId', 'Appointment ID', 'Appointment > Get Many', '/appointment/change_status', 'qs.id'],
			['appointment', 'get', 'getId', 'Appointment ID', 'Appointment > Get Many', '/appointment/get_appointment', 'qs.id'],
			['estimate', 'get', 'treatmentId', 'Treatment ID', 'Estimate > Get Many', '/estimates/get', 'qs.treatment_id'],
		];
		for (const [recurso, operacao, parametro, rotulo, origem, rota, caminhoDoId] of casos) {
			it(`${recurso} ${operacao}: vazio é recusado e espaço das pontas sai`, async () => {
				for (const vazio of ['', '   ']) {
					await assert.rejects(
						executar({
							recurso,
							operacao,
							parametros: { [parametro]: vazio, statusId: 's1', getCodeLink: 'abc' },
							typeVersion: 2,
						}),
						(erro) => {
							assert.equal(erro.message, `The '${rotulo}' parameter is empty [item 0]`);
							assert.equal(erro.description, `Get the ID from ${origem}`);
							return true;
						},
					);
				}
				// Texto com espaços nas pontas e ID numérico (expressão como {{ $json.id }}).
				for (const [entrada, esperado] of [[' x1 ', 'x1'], [12345, '12345'], [0, '0']]) {
					const { contexto } = await executar({
						recurso,
						operacao,
						parametros: { [parametro]: entrada, statusId: 's1', getCodeLink: 'abc' },
						typeVersion: 2,
					});
					const requisicao = contexto.requisicoes[0];
					assert.equal(requisicao.url, rota);
					const [origemDoCampo, chave] = caminhoDoId.split('.');
					assert.equal(requisicao[origemDoCampo === 'body' ? 'body' : 'qs'][chave], esperado);
				}
			});
		}
	});

	it('campos de ID têm placeholder e descrição de origem', () => {
		const origem = {
			cancelId: /Appointment > Get Many/,
			confirmId: /Appointment > Get Many/,
			changeStatusId: /Appointment > Get Many/,
			getId: /Appointment > Get Many/,
			treatmentId: /Estimate > Get Many/,
			patientId: /Patient > Get/,
		};
		for (const [nome, regex] of Object.entries(origem)) {
			const propriedade = new Clinicorp().description.properties.find(
				(p) => p.name === nome && valeParaVersao2(p),
			);
			assert.ok(propriedade, `falta ${nome}`);
			assert.ok(propriedade.placeholder, `${nome} sem placeholder`);
			assert.match(propriedade.description, regex);
		}
	});
});

describe('S4 toda chamada tem timeout', () => {
	for (const versao of [1, 2]) {
		it(`requisição leva timeout de 30000 na v${versao}`, async () => {
			const { contexto } = await executar({
				recurso: 'patient',
				operacao: 'get',
				parametros: { patientId: 'p1', additionalFilters: {} },
				typeVersion: versao,
			});
			assert.equal(contexto.requisicoes[0].timeout, 30000);
		});
	}

	it('timeout vira NodeApiError ou item de erro', async () => {
		const falha = () => {
			const erro = new Error('timeout of 30000ms exceeded');
			erro.code = 'ECONNABORTED';
			throw erro;
		};
		const parametros = { patientId: 'p1', additionalFilters: {} };
		await assert.rejects(
			executar({ recurso: 'patient', operacao: 'get', parametros, typeVersion: 2, resposta: falha }),
			(erro) => {
				assert.equal(erro.name, 'NodeApiError');
				assert.match(erro.message, /connection was aborted/);
				return true;
			},
		);
		const { saida } = await executar({
			recurso: 'patient',
			operacao: 'get',
			parametros,
			typeVersion: 2,
			resposta: falha,
			continuarComFalha: true,
		});
		assert.match(saida[0][0].json.error, /connection was aborted/);
	});

	it('loadOptions e teste de credencial levam timeout', async () => {
		const contexto = criarContexto({ resposta: [] });
		await loadOptions.getProcedures.call(contexto);
		await loadOptions.getClinics.call(contexto);
		await loadOptions.getProfessionals.call(contexto);
		assert.ok(contexto.requisicoes.length >= 3);
		for (const req of contexto.requisicoes) assert.equal(req.timeout, 30000);
		assert.equal(new ClinicorpApi().test.request.timeout, 30000);
	});
});
