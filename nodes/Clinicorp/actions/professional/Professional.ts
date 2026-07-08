import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest } from '../../transport';

const showOnlyForProfessionals = {
	resource: ['professional'],
};

export const professionalDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForProfessionals },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many professionals',
				description: 'List all professionals (profissionais) of the system',
			},
		],
		default: 'getMany',
	},

	// ----- Get Many -----
	{
		displayName: 'Only Online Scheduling',
		name: 'fromOnlineScheduling',
		type: 'boolean',
		default: false,
		displayOptions: { show: { ...showOnlyForProfessionals, operation: ['getMany'] } },
		description: 'Whether to return only professionals available for online scheduling',
	},
];

export async function executeProfessional(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'getMany') {
		const fromOnlineScheduling = this.getNodeParameter('fromOnlineScheduling', i, false) as boolean;

		const qs: IDataObject = {};
		if (fromOnlineScheduling) qs.fromOnlineScheduling = true;

		return clinicorpApiRequest.call(this, 'GET', '/professional/list_all_professionals', {}, qs);
	}

	return {};
}
