/**
 * Leitura dos campos guiados da versão 2 do node Clinicorp.
 *
 * Por que este módulo existe: a versão 2 troca texto livre por lista (procedimentos), valida o
 * horário e o ID antes de chamar a API. A versão 1 precisa continuar enviando exatamente o que a
 * 1.1.2 enviava, então toda função aqui checa a versão do node e, na versão 1, devolve o valor
 * como veio. Assim a regra de "v1 ou v2" mora num lugar só, e os testes a alcançam pelo `execute`.
 */
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/** Primeira versão do node que usa os campos guiados. */
const FIRST_GUIDED_VERSION = 2;

/** Horário de 24 horas com dois dígitos em cada parte, de 00:00 a 23:59. */
const TIME_24H = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Diz se o item roda na versão 2 (ou mais nova) do node. */
export function usesGuidedFields(context: IExecuteFunctions): boolean {
	return context.getNode().typeVersion >= FIRST_GUIDED_VERSION;
}

/**
 * Lê um ID obrigatório de texto.
 * Na versão 2 tira os espaços das pontas e recusa valor vazio antes de chamar a API; na versão 1
 * devolve o texto sem mexer, como a 1.1.2 fazia.
 *
 * @param name nome do parâmetro no node, por exemplo `cancelId`
 * @param label rótulo que a pessoa vê no editor, usado na mensagem de erro
 * @param origin operação do node que mostra esse ID, para a dica do erro
 */
export function readRequiredId(
	this: IExecuteFunctions,
	name: string,
	label: string,
	origin: string,
	i: number,
): string {
	const value = this.getNodeParameter(name, i) as string;
	if (!usesGuidedFields(this)) return value;

	const id = (value ?? '').trim();
	if (id) return id;

	throw new NodeOperationError(this.getNode(), `The '${label}' parameter is empty [item ${i}]`, {
		itemIndex: i,
		description: `Get the ID from ${origin}`,
	});
}

/**
 * Valida um horário no formato HH:mm (24 horas) na versão 2.
 * Valor vazio passa: nos campos opcionais ele significa "não enviar".
 * Na versão 1 não valida nada, para manter o comportamento da 1.1.2.
 */
export function checkTime(this: IExecuteFunctions, value: string, label: string, i: number): string {
	if (!usesGuidedFields(this) || !value) return value;
	if (TIME_24H.test(value)) return value;

	throw new NodeOperationError(
		this.getNode(),
		`The '${label}' parameter must use the 24-hour format HH:mm [item ${i}]`,
		{ itemIndex: i, description: 'Use two digits for the hour and the minutes, for example 14:00' },
	);
}

/**
 * Normaliza os procedimentos do agendamento.
 * A API recebe um texto com os nomes separados por vírgula e espaço. Na versão 2 o campo é uma
 * lista de nomes; ela vira esse mesmo texto, e a lista vazia some do corpo. Na versão 1 o texto
 * livre segue como está.
 */
export function normalizeProcedures(context: IExecuteFunctions, fields: IDataObject): IDataObject {
	if (!usesGuidedFields(context) || !Array.isArray(fields.procedures)) return fields;

	const { procedures, ...rest } = fields;
	const names = (procedures as string[]).filter(Boolean);
	return names.length ? { ...rest, procedures: names.join(', ') } : rest;
}
