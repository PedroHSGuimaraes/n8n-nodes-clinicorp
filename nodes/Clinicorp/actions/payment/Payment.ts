import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toApiDate } from '../../helpers/format';

const showOnlyForPayments = {
	resource: ['payment'],
};

export const paymentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForPayments },
		options: [
			{
				name: 'Get Health Insurance Claims',
				value: 'getHealthInsuranceClaims',
				action: 'Get health insurance claims',
				description:
					'List health-insurance billing (guias de convênio) in a date range, filtered by reconciliation status',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many payments',
				description: 'List the payments (pagamentos/recebimentos) registered in a date range',
			},
		],
		default: 'getMany',
	},

	// ----- Shared date range (all operations) -----
	{
		displayName: 'From Date',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForPayments },
		description:
			'Start date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'to',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForPayments },
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},

	// ----- Get Health Insurance Claims -----
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'ALL',
		options: [
			{ name: 'All', value: 'ALL' },
			{ name: 'Dispute', value: 'DISPUTE' },
			{ name: 'Open', value: 'OPEN' },
			{ name: 'Paid', value: 'PAID' },
			{ name: 'Partial Paid', value: 'PARTIAL_PAID' },
			{ name: 'Reject', value: 'REJECT' },
		],
		displayOptions: { show: { ...showOnlyForPayments, operation: ['getHealthInsuranceClaims'] } },
		description:
			'Filter the health-insurance billing (guias de convênio) by reconciliation status. One of: ALL (all claims), OPEN (awaiting payment), DISPUTE (under appeal), REJECT (denied/glosa), PARTIAL_PAID (partially paid), PAID (fully paid).',
	},

	// ----- Get Many -----
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForPayments, operation: ['getMany'] } },
		options: [
			{
				displayName: 'Date Type',
				name: 'dateType',
				type: 'string',
				default: '',
				description:
					'Leave empty to filter by receipt date; use "postDate" to filter by creation date',
			},
			{
				displayName: 'Get Amount With Discounts',
				name: 'getAmountWithDiscounts',
				type: 'boolean',
				default: false,
				description: 'Whether to return amounts already reduced by their discounts',
			},
			{
				displayName: 'Include Total Amount',
				name: 'includeTotalAmount',
				type: 'boolean',
				default: false,
				description: 'Whether to include the total amount summed across the returned payments',
			},
		],
	},
];

export async function executePayment(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const subscriberId = await getSubscriberId.call(this, i);

	if (operation === 'getHealthInsuranceClaims') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const type = this.getNodeParameter('type', i) as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
			type,
		};

		return clinicorpApiRequest.call(this, 'GET', '/payment/list_reconcile_claim', {}, qs);
	}

	if (operation === 'getMany') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		if (additionalFields.dateType) qs.date_type = additionalFields.dateType;
		if (additionalFields.getAmountWithDiscounts) qs.get_amount_with_discounts = 'X';
		if (additionalFields.includeTotalAmount) qs.include_total_amount = 'X';

		return clinicorpApiRequest.call(this, 'GET', '/payment/list', {}, qs);
	}

	return {};
}
