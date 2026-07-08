import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toApiDate } from '../../helpers/format';

const showOnlyForOperational = {
	resource: ['operational'],
};

export const operationalDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForOperational },
		options: [
			{
				name: 'Get Miss Goals',
				value: 'getMissGoals',
				action: 'Get miss goals',
				description:
					'Retrieve the absence/no-show goals for the period and the total number of absences',
			},
			{
				name: 'Get Sales Goals',
				value: 'getSalesGoals',
				action: 'Get sales goals',
				description: 'Retrieve the sales goals for the period, the total sales and the projection',
			},
		],
		default: 'getMissGoals',
	},

	// ----- Shared date range (all operations) -----
	{
		displayName: 'From Date',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: { ...showOnlyForOperational, operation: ['getMissGoals', 'getSalesGoals'] },
		},
		description:
			'Start date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'to',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: { ...showOnlyForOperational, operation: ['getMissGoals', 'getSalesGoals'] },
		},
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},

	// ----- Get Miss Goals -----
	{
		displayName: 'Clinic Name or ID',
		name: 'businessId',
		type: 'options',
		default: '',
		displayOptions: { show: { ...showOnlyForOperational, operation: ['getMissGoals'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Optionally restrict results to a single clinic (id de uma clínica específica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ----- Get Sales Goals -----
	{
		displayName: 'Clinic Name or ID',
		name: 'businessId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForOperational, operation: ['getSalesGoals'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic (id de uma clínica) to report the sales goals for. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function executeOperational(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const subscriberId = await getSubscriberId.call(this, i);
	const from = this.getNodeParameter('from', i) as string;
	const to = this.getNodeParameter('to', i) as string;

	if (operation === 'getMissGoals') {
		const businessId = this.getNodeParameter('businessId', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
			isAPI: 'X',
		};
		if (businessId) qs.business_id = businessId;

		return clinicorpApiRequest.call(this, 'GET', '/operational/list_misses_goals', {}, qs);
	}

	if (operation === 'getSalesGoals') {
		const businessId = this.getNodeParameter('businessId', i) as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
			isAPI: 'X',
			business_id: businessId,
		};

		return clinicorpApiRequest.call(this, 'GET', '/operational/list_sales_goals', {}, qs);
	}

	return {};
}
