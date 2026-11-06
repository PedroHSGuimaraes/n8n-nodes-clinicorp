import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { clinicorpApiRequest } from '../transport';

/**
 * Map an array of Clinicorp records into n8n dropdown options.
 * Clinicorp uses mixed casing, so we probe several common label keys.
 */
function toOptions(
	response: IDataObject | IDataObject[],
	labelKeys: string[],
): INodePropertyOptions[] {
	// A Clinicorp devolve lista nas rotas de listagem; qualquer outro formato vira lista vazia
	// para o seletor não quebrar o editor do n8n.
	const items = Array.isArray(response) ? response : [];
	return items
		.filter(Boolean)
		.map((item) => {
			const label =
				labelKeys.map((k) => item[k]).find((v) => v !== undefined && v !== null && v !== '') ??
				item.id;
			const value = item.id ?? item._id ?? item.BusinessId ?? item.Id;
			return { name: String(label), value: (value ?? '') as string | number };
		})
		.filter((o) => o.value !== '' && o.value !== undefined && o.value !== null)
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** Read the Default Subscriber ID stored in the credential (for list calls that need it). */
async function credentialSubscriberId(this: ILoadOptionsFunctions): Promise<string> {
	const credentials = await this.getCredentials('clinicorpApi');
	return ((credentials?.subscriberId as string) ?? '').trim();
}

export const loadOptions = {
	async getClinics(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const subscriberId = await credentialSubscriberId.call(this);
		if (!subscriberId) {
			return [];
		}
		const items = await clinicorpApiRequest.call(
			this,
			'GET',
			'/business/list',
			{},
			{
				subscriber_id: subscriberId,
			},
		);
		return toOptions(items, ['Name', 'BusinessName', 'name']);
	},

	async getProfessionals(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const items = await clinicorpApiRequest.call(
			this,
			'GET',
			'/professional/list_all_professionals',
		);
		return toOptions(items, ['name', 'Name']);
	},

	async getAppointmentStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const subscriberId = await credentialSubscriberId.call(this);
		if (!subscriberId) {
			return [];
		}
		const items = await clinicorpApiRequest.call(
			this,
			'GET',
			'/appointment/status_list',
			{},
			{
				subscriber_id: subscriberId,
			},
		);
		return toOptions(items, ['Description', 'name']);
	},

	async getAppointmentCategories(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const items = await clinicorpApiRequest.call(this, 'GET', '/appointment/list_categories');
		return toOptions(items, ['Description', 'name']);
	},

	async getSpecialties(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const subscriberId = await credentialSubscriberId.call(this);
		if (!subscriberId) {
			return [];
		}
		const items = await clinicorpApiRequest.call(
			this,
			'GET',
			'/procedures/list_specialties',
			{},
			{
				subscriber_id: subscriberId,
			},
		);
		return toOptions(items, ['Description', 'name']);
	},

	async getProcedures(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const items = await clinicorpApiRequest.call(this, 'GET', '/procedures/list');
		// A API de agendamento recebe o NOME do procedimento (texto), não o ID; por isso o valor
		// do seletor é o próprio nome. Item sem `id` entra (o nome basta) e nome repetido aparece
		// uma vez só, para a pessoa não ver duas opções iguais.
		const list = Array.isArray(items) ? items : [];
		const names = list
			.map((item) => String(item.ProcedureName ?? item.Description ?? item.name ?? '').trim())
			.filter(Boolean);
		return [...new Set(names)]
			.sort((a, b) => a.localeCompare(b))
			.map((name) => ({ name, value: name }));
	},
};
