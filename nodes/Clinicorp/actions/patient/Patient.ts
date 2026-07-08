import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toApiDate } from '../../helpers/format';

const showOnlyForPatients = {
	resource: ['patient'],
};

export const patientDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForPatients },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a patient',
				description:
					'Register a new patient (paciente) in Clinicorp with name and optional contact and document details',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a patient',
				description:
					'Retrieve a single patient (paciente) by ID or by another identifying field such as name, document, phone or email',
			},
			{
				name: 'Get Birthdays',
				value: 'getBirthdays',
				action: 'Get birthday patients',
				description:
					'List the patients (pacientes) celebrating a birthday on a given date; when no date is provided the API uses today',
			},
			{
				name: 'Get Estimate Totals',
				value: 'getEstimateTotals',
				action: 'Get patient estimate totals',
				description:
					'Return the sum of estimates (orçamentos) in the reference period, optionally restricted to a single clinic',
			},
			{
				name: 'Get Many Appointments',
				value: 'getManyAppointments',
				action: 'Get many patient appointments',
				description: 'List all appointments (agendamentos) of a single patient by their patient ID',
			},
		],
		default: 'get',
	},

	// ----- Create -----
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForPatients, operation: ['create'] } },
		description: 'Full name of the patient (nome do paciente) to create',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForPatients, operation: ['create'] } },
		options: [
			{
				displayName: 'Birth Date',
				name: 'birthDate',
				type: 'dateTime',
				default: '',
				description:
					'Date of birth of the patient. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
			},
			{
				displayName: 'CPF',
				name: 'cpf',
				type: 'string',
				default: '',
				description:
					'Patient CPF / other document (documento) recorded on the patient card. Send only digits, e.g. 12345678909.',
			},
			{
				displayName: 'Document ID',
				name: 'documentId',
				type: 'string',
				default: '',
				description: 'Primary document identifier of the patient (documento de identidade)',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address of the patient',
			},
			{
				displayName: 'Ignore Duplicate Document',
				name: 'ignoreSameDoc',
				type: 'boolean',
				default: false,
				description:
					'Whether to force creation even if a patient with the same document already exists',
			},
			{
				displayName: 'Ignore Duplicate Name',
				name: 'ignoreSameName',
				type: 'boolean',
				default: false,
				description:
					'Whether to force creation even if a patient with the same name already exists',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
				description:
					'Mobile phone number of the patient (celular), including country and area code, e.g. +55 21 99999-9999. Digits only (5521999999999) is also accepted.',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Free-form notes (observações) to store on the patient card',
			},
			{
				displayName: 'Sex',
				name: 'sex',
				type: 'string',
				default: '',
				description: 'Patient sex/gender as expected by Clinicorp, e.g. M or F',
			},
		],
	},

	// ----- Get -----
	{
		displayName: 'Patient ID',
		name: 'patientId',
		type: 'string',
		default: '',
		displayOptions: { show: { ...showOnlyForPatients, operation: ['get'] } },
		description: 'Search by patient ID; leave empty to search by another field below',
	},
	{
		displayName: 'Additional Filters',
		name: 'additionalFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...showOnlyForPatients, operation: ['get'] } },
		options: [
			{
				displayName: 'CPF',
				name: 'cpf',
				type: 'string',
				default: '',
				description:
					'Search by patient CPF / other document (documento). Send only digits, e.g. 12345678909.',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Search by patient email address',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Search by patient name (nome do paciente)',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Search by patient phone number (telefone)',
			},
		],
	},

	// ----- Get Birthdays -----
	{
		displayName: 'Date',
		name: 'date',
		type: 'dateTime',
		default: '',
		displayOptions: { show: { ...showOnlyForPatients, operation: ['getBirthdays'] } },
		description:
			'Reference date to look up birthdays. Only the date part (YYYY-MM-DD) is sent; leave empty to use today.',
	},

	// ----- Get Estimate Totals -----
	{
		displayName: 'From Date',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForPatients, operation: ['getEstimateTotals'] } },
		description:
			'Start date of the reference period. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'to',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForPatients, operation: ['getEstimateTotals'] } },
		description:
			'End date of the reference period. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'Clinic Name or ID',
		name: 'businessId',
		type: 'options',
		default: '',
		displayOptions: { show: { ...showOnlyForPatients, operation: ['getEstimateTotals'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Optionally restrict the totals to a single clinic (id de uma clínica específica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ----- Get Many Appointments -----
	{
		displayName: 'Patient ID',
		name: 'appointmentsPatientId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForPatients, operation: ['getManyAppointments'] } },
		description: 'Unique ID of the patient (id do paciente) whose appointments will be listed',
	},
];

export async function executePatient(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'create') {
		const subscriberId = await getSubscriberId.call(this, i);
		const name = this.getNodeParameter('name', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = {
			subscriber_id: subscriberId,
			Name: name,
		};

		if (additionalFields.birthDate) {
			body.BirthDate = toApiDate(additionalFields.birthDate as string);
		}
		if (additionalFields.cpf) body.OtherDocumentId = additionalFields.cpf as string;
		if (additionalFields.documentId) body.DocumentId = additionalFields.documentId as string;
		if (additionalFields.email) body.Email = additionalFields.email as string;
		if (additionalFields.mobilePhone) body.MobilePhone = additionalFields.mobilePhone as string;
		if (additionalFields.notes) body.Notes = additionalFields.notes as string;
		if (additionalFields.sex) body.Sex = additionalFields.sex as string;
		if (additionalFields.ignoreSameDoc) body.IgnoreSameDoc = 'X';
		if (additionalFields.ignoreSameName) body.IgnoreSameName = 'X';

		return clinicorpApiRequest.call(this, 'POST', '/patient/create', body, {});
	}

	if (operation === 'get') {
		const subscriberId = await getSubscriberId.call(this, i);
		const patientId = this.getNodeParameter('patientId', i, '') as string;
		const additionalFilters = this.getNodeParameter('additionalFilters', i, {}) as IDataObject;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
		};
		if (patientId) qs.PatientId = patientId;
		if (additionalFilters.cpf) qs.OtherDocumentId = additionalFilters.cpf as string;
		if (additionalFilters.email) qs.Email = additionalFilters.email as string;
		if (additionalFilters.name) qs.Name = additionalFilters.name as string;
		if (additionalFilters.phone) qs.Phone = additionalFilters.phone as string;

		return clinicorpApiRequest.call(this, 'GET', '/patient/get', {}, qs);
	}

	if (operation === 'getBirthdays') {
		const subscriberId = await getSubscriberId.call(this, i);
		const date = this.getNodeParameter('date', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
		};
		if (date) qs.date = toApiDate(date);

		return clinicorpApiRequest.call(this, 'GET', '/patient/birthdays', {}, qs);
	}

	if (operation === 'getEstimateTotals') {
		const subscriberId = await getSubscriberId.call(this, i);
		const from = this.getNodeParameter('from', i) as string;
		const to = this.getNodeParameter('to', i) as string;
		const businessId = this.getNodeParameter('businessId', i, '') as string;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		if (businessId) qs.business_id = businessId;

		return clinicorpApiRequest.call(this, 'GET', '/patient/list_estimates', {}, qs);
	}

	if (operation === 'getManyAppointments') {
		const patientId = this.getNodeParameter('appointmentsPatientId', i) as string;

		const qs: IDataObject = {
			PatientId: patientId,
		};

		return clinicorpApiRequest.call(this, 'GET', '/patient/list_appointments', {}, qs);
	}

	return {};
}
