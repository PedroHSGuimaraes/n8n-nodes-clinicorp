import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';

const showOnlyForProcedures = {
	resource: ['procedure'],
};

export const procedureDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForProcedures },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many procedures',
				description: 'Return the procedures (procedimentos) from the price lists',
			},
			{
				name: 'Get Many Specialties',
				value: 'getManySpecialties',
				action: 'Get many specialties',
				description: 'Return the franchise specialties (especialidades)',
			},
		],
		default: 'getMany',
	},
];

export async function executeProcedure(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'getMany') {
		return clinicorpApiRequest.call(this, 'GET', '/procedures/list');
	}

	if (operation === 'getManySpecialties') {
		const subscriberId = await getSubscriberId.call(this, i);

		return clinicorpApiRequest.call(
			this,
			'GET',
			'/procedures/list_specialties',
			{},
			{
				subscriber_id: subscriberId,
			},
		);
	}

	return {};
}
