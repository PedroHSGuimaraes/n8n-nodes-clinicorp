import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toApiDate } from '../../helpers/format';

const showOnlyForAnalytics = {
	resource: ['analytics'],
};

export const analyticsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForAnalytics },
		options: [
			{
				name: 'Get Results',
				value: 'getResults',
				action: 'Get analytics results',
				description:
					'Retrieve analytics across all clinics of the subscriber — total estimates, total sales, total expenses and total appointments in the period',
			},
		],
		default: 'getResults',
	},

	// ----- Get Results -----
	{
		displayName: 'From Date',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAnalytics, operation: ['getResults'] } },
		description:
			'Start date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'to',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAnalytics, operation: ['getResults'] } },
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
];

export async function executeAnalytics(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'getResults') {
		const subscriberId = await getSubscriberId.call(this, i);
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};

		return clinicorpApiRequest.call(this, 'GET', '/analytics/list_results', {}, qs);
	}

	return {};
}
