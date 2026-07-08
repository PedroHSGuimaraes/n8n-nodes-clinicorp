import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest } from '../../transport';

const showOnlyForGroup = {
	resource: ['group'],
};

export const groupDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForGroup },
		options: [
			{
				name: 'Get Clinics Info',
				value: 'getClinicsInfo',
				action: 'Get clinics info',
				description: 'Lists info about the subscriber clinics (name, type, working hours)',
			},
			{
				name: 'Get Franchise Units',
				value: 'getFranchiseUnits',
				action: 'Get franchise units',
				description: 'Lists the franchise units',
			},
		],
		default: 'getClinicsInfo',
	},
];

export async function executeGroup(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'getClinicsInfo') {
		return clinicorpApiRequest.call(this, 'GET', '/group/list_subscribers_clinics');
	}

	if (operation === 'getFranchiseUnits') {
		return clinicorpApiRequest.call(this, 'GET', '/group/list_subscribers');
	}

	return {};
}
