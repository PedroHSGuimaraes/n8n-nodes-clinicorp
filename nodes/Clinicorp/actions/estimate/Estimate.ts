import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toApiDate } from '../../helpers/format';

// ---------------------------------------------------------------------------
// TEMPLATE RESOURCE — every other Clinicorp resource mirrors this file:
//   1. `<resource>Description` = operations dropdown + fields (INodeProperties[])
//   2. `execute<Resource>(operation, i)` = programmatic dispatch via the transport
// Conventions: displayNames in Title Case; operation names + descriptions in
// Sentence case; options alphabetically sorted; loadOptions fields suffixed
// "Name or ID"; every field has a default. The Subscriber ID is never a node
// parameter — getSubscriberId() reads it from the credential.
// ---------------------------------------------------------------------------

const showOnlyForEstimates = {
	resource: ['estimate'],
};

export const estimateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForEstimates },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get an estimate',
				description:
					'Retrieve a single estimate (orçamento) by its treatment ID, including status, professional, values and the full list of procedures',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many estimates',
				description:
					'List the estimates (orçamentos) of the clinics in a date range, detailing status, professional, total value and procedures',
			},
		],
		default: 'getMany',
	},

	// ----- Get -----
	{
		displayName: 'Treatment ID',
		name: 'treatmentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForEstimates, operation: ['get'] } },
		description: 'Unique ID of the estimate/treatment (id do orçamento) to retrieve',
	},

	// ----- Get Many -----
	{
		displayName: 'From Date',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForEstimates, operation: ['getMany'] } },
		description:
			'Start date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'to',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForEstimates, operation: ['getMany'] } },
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'Clinic Name or ID',
		name: 'clinicId',
		type: 'options',
		default: '',
		displayOptions: { show: { ...showOnlyForEstimates, operation: ['getMany'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Optionally restrict results to a single clinic (id de uma clínica específica), useful for multi-clinic units. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function executeEstimate(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const subscriberId = await getSubscriberId.call(this, i);

	if (operation === 'get') {
		const treatmentId = this.getNodeParameter('treatmentId', i) as string;
		return clinicorpApiRequest.call(
			this,
			'GET',
			'/estimates/get',
			{},
			{
				subscriber_id: subscriberId,
				treatment_id: treatmentId,
			},
		);
	}

	if (operation === 'getMany') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const clinicId = this.getNodeParameter('clinicId', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		if (clinicId) qs.clinic_id = clinicId;

		return clinicorpApiRequest.call(this, 'GET', '/estimates/list', {}, qs);
	}

	return {};
}
