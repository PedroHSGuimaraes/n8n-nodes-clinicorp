import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toApiDate } from '../../helpers/format';

const showOnlyForSales = {
	resource: ['sales'],
};

export const salesDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForSales },
		options: [
			{
				name: 'Get Estimates And Conversion',
				value: 'getEstimatesAndConversion',
				action: 'Get estimates and conversion',
				description:
					'Retrieve totals of estimates by status, with count, total value, average ticket and conversion rate for a clinic in a date range',
			},
			{
				name: 'Get Revenue By Specialty',
				value: 'getRevenueBySpecialty',
				action: 'Get revenue by specialty',
				description:
					'Retrieve revenue grouped by specialty (month and total sales per specialty) for the date range',
			},
		],
		default: 'getEstimatesAndConversion',
	},

	// ----- Shared date range (all operations) -----
	{
		displayName: 'From Date',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: {
			show: {
				...showOnlyForSales,
				operation: ['getEstimatesAndConversion', 'getRevenueBySpecialty'],
			},
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
			show: {
				...showOnlyForSales,
				operation: ['getEstimatesAndConversion', 'getRevenueBySpecialty'],
			},
		},
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},

	// ----- Get Estimates And Conversion -----
	{
		displayName: 'Clinic Name or ID',
		name: 'businessId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: {
			show: { ...showOnlyForSales, operation: ['getEstimatesAndConversion'] },
		},
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic (id de uma clínica) to report on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Group By',
		name: 'groupBy',
		type: 'options',
		required: true,
		default: 'month',
		options: [
			{ name: 'Month', value: 'month' },
			{ name: 'None', value: '' },
		],
		displayOptions: {
			show: { ...showOnlyForSales, operation: ['getEstimatesAndConversion'] },
		},
		description:
			'Group the results. Choose Month to aggregate values by month across the date range.',
	},

	// ----- Get Revenue By Specialty -----
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { ...showOnlyForSales, operation: ['getRevenueBySpecialty'] },
		},
		options: [
			{
				displayName: 'Clinic Name or ID',
				name: 'businessId',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getClinics' },
				description:
					'Optionally restrict results to a single clinic (id de uma clínica específica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Patient ID',
				name: 'patientId',
				type: 'string',
				default: '',
				description:
					'Optionally restrict results to the revenue of a single patient (id do paciente)',
			},
		],
	},
];

export async function executeSales(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const subscriberId = await getSubscriberId.call(this, i);
	const from = this.getNodeParameter('from', i) as string;
	const to = this.getNodeParameter('to', i) as string;

	if (operation === 'getEstimatesAndConversion') {
		const businessId = this.getNodeParameter('businessId', i) as string;
		const groupBy = this.getNodeParameter('groupBy', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
			business_id: businessId,
		};
		if (groupBy) qs.group_by = groupBy;

		return clinicorpApiRequest.call(this, 'GET', '/sales/estimates_and_conversion', {}, qs);
	}

	if (operation === 'getRevenueBySpecialty') {
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		if (additionalFields.businessId) qs.businessId = additionalFields.businessId as string;
		if (additionalFields.patientId) qs.patientId = additionalFields.patientId as string;

		return clinicorpApiRequest.call(this, 'GET', '/sales/expertise_revenue', {}, qs);
	}

	return {};
}
