import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toCompactDate } from '../../helpers/format';

const showOnlyForBusiness = {
	resource: ['business'],
};

export const businessDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForBusiness },
		options: [
			{
				name: 'Get Available Times',
				value: 'getAvailableTimes',
				action: 'Get available times',
				description:
					"List the free time slots (horários livres) of a professional's agenda in a clinic, between two dates. This is the availability lookup to use before booking with Appointment > Create: take a returned slot and pass it as From Time / To Time. It does not need a booking Code Link — for the public online-booking availability use Appointment > Get Available Times instead.",
			},
			{
				name: 'Get Chairs',
				value: 'getChairs',
				action: 'Get clinic chairs',
				description: 'List the chairs (cadeiras) registered for a specific clinic',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many clinics',
				description: 'List the clinics (unidades) of the subscriber',
			},
		],
		default: 'getMany',
	},

	// ----- Get Available Times -----
	{
		displayName: 'Professional Name or ID',
		name: 'professionalId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForBusiness, operation: ['getAvailableTimes'] } },
		typeOptions: { loadOptionsMethod: 'getProfessionals' },
		description:
			'Professional whose available times will be listed. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Clinic Name or ID',
		name: 'clinicId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForBusiness, operation: ['getAvailableTimes'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic (unidade) where the available times will be searched. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'From Date',
		name: 'fromDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForBusiness, operation: ['getAvailableTimes'] } },
		description:
			'Start date of the search range. Only the date part (YYYYMMDD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'toDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForBusiness, operation: ['getAvailableTimes'] } },
		description:
			'End date of the search range. Only the date part (YYYYMMDD) is sent to Clinicorp.',
	},

	// ----- Get Chairs -----
	{
		displayName: 'Clinic Name or ID',
		name: 'chairsClinicId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForBusiness, operation: ['getChairs'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic (unidade) whose chairs will be listed. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function executeBusiness(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'getAvailableTimes') {
		const professionalId = this.getNodeParameter('professionalId', i) as string;
		const clinicId = this.getNodeParameter('clinicId', i) as string;
		const fromDate = this.getNodeParameter('fromDate', i) as string;
		const toDate = this.getNodeParameter('toDate', i) as string;

		const qs: IDataObject = {
			professionalId,
			clinicId,
			fromDate: toCompactDate(fromDate),
			toDate: toCompactDate(toDate),
		};

		return clinicorpApiRequest.call(this, 'GET', '/business/list_available_times', {}, qs);
	}

	if (operation === 'getChairs') {
		const subscriberId = await getSubscriberId.call(this, i);
		const chairsClinicId = this.getNodeParameter('chairsClinicId', i) as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			Clinic_BusinessId: chairsClinicId,
		};

		return clinicorpApiRequest.call(this, 'GET', '/business/list_chairs', {}, qs);
	}

	if (operation === 'getMany') {
		const subscriberId = await getSubscriberId.call(this, i);

		return clinicorpApiRequest.call(
			this,
			'GET',
			'/business/list',
			{},
			{
				subscriber_id: subscriberId,
			},
		);
	}

	return {};
}
