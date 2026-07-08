import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toApiDate } from '../../helpers/format';

const showOnlyForFinancial = {
	resource: ['financial'],
};

export const financialDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForFinancial },
		options: [
			{
				name: 'Get Average Installments',
				value: 'getAverageInstallments',
				action: 'Get average installments',
				description:
					'Retrieve the average number of installments (média de parcelas) agreed for a clinic in a date range, optionally aggregated by month',
			},
			{
				name: 'Get Cash Flow',
				value: 'getCashFlow',
				action: 'Get cash flow',
				description:
					'List the cash flow (fluxo de caixa) of a clinic in a date range, detailing inflows and outflows',
			},
			{
				name: 'Get Invoices',
				value: 'getInvoices',
				action: 'Get invoices',
				description:
					'List the invoices (notas fiscais) issued in a date range, optionally restricted to a single clinic',
			},
			{
				name: 'Get Payments',
				value: 'getPayments',
				action: 'Get payments',
				description: 'List the payments (pagamentos) registered for a clinic in a date range',
			},
			{
				name: 'Get Receipts',
				value: 'getReceipts',
				action: 'Get receipts',
				description:
					'List the receipts (recebimentos) registered in a date range, optionally restricted to a single clinic',
			},
			{
				name: 'Get Summary',
				value: 'getSummary',
				action: 'Get financial summary',
				description:
					'Retrieve a consolidated financial summary (resumo financeiro) for a date range, optionally restricted to a single clinic',
			},
		],
		default: 'getSummary',
	},

	// ----- Shared date range (all operations) -----
	{
		displayName: 'From Date',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForFinancial },
		description:
			'Start date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'to',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: showOnlyForFinancial },
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},

	// ----- Required clinic (Get Average Installments, Get Cash Flow, Get Payments) -----
	{
		displayName: 'Clinic Name or ID',
		name: 'businessId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: {
			show: {
				...showOnlyForFinancial,
				operation: ['getAverageInstallments', 'getCashFlow', 'getPayments'],
			},
		},
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic (business) whose data will be returned (id da clínica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ----- Optional clinic (Get Invoices, Get Receipts, Get Summary) -----
	{
		displayName: 'Clinic Name or ID',
		name: 'businessId',
		type: 'options',
		default: '',
		displayOptions: {
			show: {
				...showOnlyForFinancial,
				operation: ['getInvoices', 'getReceipts', 'getSummary'],
			},
		},
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Optionally restrict results to a single clinic (id de uma clínica específica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ----- Get Average Installments -----
	{
		displayName: 'Group By',
		name: 'groupBy',
		type: 'options',
		default: 'month',
		options: [
			{ name: 'Month', value: 'month' },
			{ name: 'None', value: '' },
		],
		displayOptions: { show: { ...showOnlyForFinancial, operation: ['getAverageInstallments'] } },
		description:
			'Group the results. Choose Month to aggregate values by month across the date range.',
	},
];

export async function executeFinancial(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const subscriberId = await getSubscriberId.call(this, i);

	if (operation === 'getAverageInstallments') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const businessId = this.getNodeParameter('businessId', i) as string;
		const groupBy = this.getNodeParameter('groupBy', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
			business_id: businessId,
		};
		if (groupBy) qs.group_by = groupBy;

		return clinicorpApiRequest.call(this, 'GET', '/financial/average_installments', {}, qs);
	}

	if (operation === 'getCashFlow') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const businessId = this.getNodeParameter('businessId', i) as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
			business_id: businessId,
		};

		return clinicorpApiRequest.call(this, 'GET', '/financial/list_cash_flow', {}, qs);
	}

	if (operation === 'getInvoices') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const businessId = this.getNodeParameter('businessId', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		if (businessId) qs.business_id = businessId;

		return clinicorpApiRequest.call(this, 'GET', '/financial/list_invoices', {}, qs);
	}

	if (operation === 'getPayments') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const businessId = this.getNodeParameter('businessId', i) as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
			business_id: businessId,
		};

		return clinicorpApiRequest.call(this, 'GET', '/financial/list_payments', {}, qs);
	}

	if (operation === 'getReceipts') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const businessId = this.getNodeParameter('businessId', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		if (businessId) qs.business_id = businessId;

		return clinicorpApiRequest.call(this, 'GET', '/financial/list_receipt', {}, qs);
	}

	if (operation === 'getSummary') {
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const businessId = this.getNodeParameter('businessId', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		if (businessId) qs.business_id = businessId;

		return clinicorpApiRequest.call(this, 'GET', '/financial/list_summary', {}, qs);
	}

	return {};
}
