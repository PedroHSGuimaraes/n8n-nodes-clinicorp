import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';

const showOnlyForUsers = {
	resource: ['user'],
};

export const userDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForUsers },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many users',
				description: 'List all users (usuários) of the system',
			},
		],
		default: 'getMany',
	},
];

export async function executeUser(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'getMany') {
		const subscriberId = await getSubscriberId.call(this, i);

		return clinicorpApiRequest.call(
			this,
			'GET',
			'/security/list_users',
			{},
			{
				subscriber_id: subscriberId,
			},
		);
	}

	return {};
}
