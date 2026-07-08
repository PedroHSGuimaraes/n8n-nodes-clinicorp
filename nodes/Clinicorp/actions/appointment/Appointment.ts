import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';
import { toApiDate, pickMapped } from '../../helpers/format';

const showOnlyForAppointments = {
	resource: ['appointment'],
};

export const appointmentDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForAppointments },
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				action: 'Cancel an appointment',
				description:
					"Cancel a scheduled appointment (cancelar agendamento), releasing the time slot in the professional's calendar",
			},
			{
				name: 'Change Status',
				value: 'changeStatus',
				action: 'Change appointment status',
				description:
					'Change the status of one or more appointments (e.g. confirmed, attended or missed) by their IDs',
			},
			{
				name: 'Confirm',
				value: 'confirm',
				action: 'Confirm an appointment',
				description:
					'Confirm a scheduled appointment (confirmar agendamento) so it is marked as confirmed in the calendar',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create an appointment',
				description:
					"Create a new appointment (criar agendamento) in a clinic's calendar for a professional and patient",
			},
			{
				name: 'Create Online Scheduling',
				value: 'createOnlineScheduling',
				action: 'Create an online scheduling request',
				description:
					'Create an online scheduling request (agendamento online) that patients can submit through the booking link',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get an appointment',
				description: 'Retrieve a single appointment by its ID using the clinic booking code link',
			},
			{
				name: 'Get Available Days',
				value: 'getAvailableDays',
				action: 'Get available days',
				description:
					'List the days that have availability for online scheduling within a date range for a given booking link',
			},
			{
				name: 'Get Available Times',
				value: 'getAvailableTimes',
				action: 'Get available times',
				description:
					'List the available time slots for a specific day and booking link for online scheduling',
			},
			{
				name: 'Get Info',
				value: 'getInfo',
				action: 'Get appointment info',
				description:
					'Retrieve aggregated appointment information (indicators) for the clinics in a date range',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many appointments',
				description:
					'List the appointments of the clinics in a date range, optionally filtered by patient or including canceled ones',
			},
			{
				name: 'Get Many Categories',
				value: 'getManyCategories',
				action: 'Get many appointment categories',
				description:
					'List the appointment categories (categorias de agendamento) configured for the account',
			},
			{
				name: 'Get Occupation',
				value: 'getOccupation',
				action: 'Get schedule occupation',
				description:
					'Retrieve the schedule occupation (ocupação de agenda) for the clinics in a date range',
			},
			{
				name: 'Get Statuses',
				value: 'getStatuses',
				action: 'Get appointment statuses',
				description:
					'List the appointment statuses (status de agendamento) configured for the account',
			},
		],
		default: 'getMany',
	},

	// ----- Cancel -----
	{
		displayName: 'Appointment ID',
		name: 'cancelId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['cancel'] } },
		description: 'Unique ID of the appointment (id do agendamento) to cancel',
	},

	// ----- Change Status -----
	{
		displayName: 'Appointment ID',
		name: 'changeStatusId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['changeStatus'] } },
		description:
			'ID of the appointment to update. To update several appointments at once, send comma-separated IDs like 1,2,3.',
	},
	{
		displayName: 'Status Name or ID',
		name: 'statusId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['changeStatus'] } },
		typeOptions: { loadOptionsMethod: 'getAppointmentStatuses' },
		description:
			'The status to apply to the appointment(s). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ----- Confirm -----
	{
		displayName: 'Appointment ID',
		name: 'confirmId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['confirm'] } },
		description: 'Unique ID of the appointment (id do agendamento) to confirm',
	},

	// ----- Create -----
	{
		displayName: 'Patient Name',
		name: 'patientName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['create'] } },
		description: 'Full name of the patient for the appointment',
	},
	{
		displayName: 'Date',
		name: 'createDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['create'] } },
		description: 'Day of the appointment. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'From Time',
		name: 'fromTime',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['create'] } },
		description: 'Start time of the appointment, e.g. 14:00',
	},
	{
		displayName: 'To Time',
		name: 'toTime',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['create'] } },
		description: 'End time of the appointment, e.g. 14:30',
	},
	{
		displayName: 'Clinic Name or ID',
		name: 'createClinicId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['create'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic where the appointment will be created (id da clínica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Professional Name or ID',
		name: 'createDentistId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['create'] } },
		typeOptions: { loadOptionsMethod: 'getProfessionals' },
		description:
			'Professional who will attend the appointment (id do profissional). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['create'] } },
		options: [
			{
				displayName: 'Category Color',
				name: 'categoryColor',
				type: 'string',
				default: '',
				description: 'Color used to identify the appointment category in the calendar',
			},
			{
				displayName: 'Category Description',
				name: 'categoryDescription',
				type: 'string',
				default: '',
				description: 'Description of the appointment category',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address of the patient',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
				description: 'Mobile phone number of the patient',
			},
			{
				displayName: 'Patient Person ID',
				name: 'patientPersonId',
				type: 'string',
				default: '',
				description: 'Existing patient person ID (id da pessoa) to link the appointment to',
			},
			{
				displayName: 'Procedures',
				name: 'procedures',
				type: 'string',
				default: '',
				description: 'Procedures associated with the appointment',
			},
			{
				displayName: 'Schedule To ID',
				name: 'scheduleToId',
				type: 'string',
				default: '',
				description: 'ID of the resource or entity the appointment is scheduled to',
			},
			{
				displayName: 'Schedule To Type',
				name: 'scheduleToType',
				type: 'string',
				default: '',
				description: 'Type of the resource or entity the appointment is scheduled to',
			},
		],
	},

	// ----- Create Online Scheduling -----
	{
		displayName: 'Patient Name',
		name: 'onlinePatientName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['createOnlineScheduling'] } },
		description: 'Full name of the patient requesting the online scheduling',
	},
	{
		displayName: 'Date',
		name: 'onlineDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['createOnlineScheduling'] } },
		description:
			'Requested day for the online scheduling. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'Clinic Name or ID',
		name: 'onlineClinicId',
		type: 'options',
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['createOnlineScheduling'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic for the online scheduling request (id da clínica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Professional Name or ID',
		name: 'onlineDentistId',
		type: 'options',
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['createOnlineScheduling'] } },
		typeOptions: { loadOptionsMethod: 'getProfessionals' },
		description:
			'Professional requested for the online scheduling (id do profissional). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['createOnlineScheduling'] } },
		options: [
			{
				displayName: 'Already Patient',
				name: 'alreadyPatient',
				type: 'boolean',
				default: false,
				description: 'Whether the requester is already a patient of the clinic',
			},
			{
				displayName: 'Code Link',
				name: 'codeLink',
				type: 'string',
				default: '',
				description: 'Booking code link (code link) that identifies the online scheduling page',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address of the patient',
			},
			{
				displayName: 'From Time',
				name: 'fromTime',
				type: 'string',
				default: '',
				description: 'Requested start time, e.g. 14:00',
			},
			{
				displayName: 'Is Online Scheduling',
				name: 'isOnlineScheduling',
				type: 'boolean',
				default: false,
				description: 'Whether to flag this request as an online scheduling',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobilePhone',
				type: 'string',
				default: '',
				description: 'Mobile phone number of the patient',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Additional notes provided by the patient',
			},
			{
				displayName: 'Other Document ID',
				name: 'otherDocumentId',
				type: 'string',
				default: '',
				description: 'Alternative document identifier of the patient',
			},
			{
				displayName: 'Other Phones',
				name: 'otherPhones',
				type: 'string',
				default: '',
				description: 'Additional phone numbers of the patient',
			},
			{
				displayName: 'Scheduling Reason',
				name: 'schedulingReason',
				type: 'string',
				default: '',
				description: 'Reason for the scheduling informed by the patient',
			},
			{
				displayName: 'To Time',
				name: 'toTime',
				type: 'string',
				default: '',
				description: 'Requested end time, e.g. 14:30',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Type of the online scheduling request',
			},
		],
	},

	// ----- Get -----
	{
		displayName: 'Code Link',
		name: 'getCodeLink',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['get'] } },
		description: 'Booking code link (code link) that identifies the clinic scheduling page',
	},
	{
		displayName: 'Appointment ID',
		name: 'getId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['get'] } },
		description: 'Unique ID of the appointment (id do agendamento) to retrieve',
	},

	// ----- Get Available Days -----
	{
		displayName: 'Code Link',
		name: 'daysCodeLink',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getAvailableDays'] } },
		description: 'Booking code link (code link) that identifies the online scheduling page',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getAvailableDays'] } },
		options: [
			{
				displayName: 'From Date',
				name: 'fromDate',
				type: 'dateTime',
				default: '',
				description:
					'Start date of the availability range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
			},
			{
				displayName: 'Include Holidays',
				name: 'includeHolidays',
				type: 'boolean',
				default: false,
				description: 'Whether to include holidays in the available days',
			},
			{
				displayName: 'Show Available Times',
				name: 'showAvailableTimes',
				type: 'boolean',
				default: false,
				description: 'Whether to also return the available time slots for each day',
			},
			{
				displayName: 'To Date',
				name: 'toDate',
				type: 'dateTime',
				default: '',
				description:
					'End date of the availability range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
			},
		],
	},

	// ----- Get Available Times -----
	{
		displayName: 'Date',
		name: 'timesDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getAvailableTimes'] } },
		description:
			'Day to check for available times. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'Code Link',
		name: 'timesCodeLink',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getAvailableTimes'] } },
		description: 'Booking code link (code link) that identifies the online scheduling page',
	},

	// ----- Get Info -----
	{
		displayName: 'From Date',
		name: 'infoFrom',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getInfo'] } },
		description:
			'Start date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'infoTo',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getInfo'] } },
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getInfo'] } },
		options: [
			{
				displayName: 'Clinic Name or ID',
				name: 'businessId',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getClinics' },
				description:
					'Optionally restrict results to a single clinic (id da clínica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Group By',
				name: 'groupBy',
				type: 'options',
				default: '',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Month', value: 'month' },
				],
				description:
					'Group the results. Choose Month to aggregate values by month across the date range.',
			},
		],
	},

	// ----- Get Many -----
	{
		displayName: 'From Date',
		name: 'listFrom',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getMany'] } },
		description:
			'Start date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'listTo',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getMany'] } },
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'Clinic Name or ID',
		name: 'listClinicId',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getMany'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic whose appointments should be listed (id da clínica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getMany'] } },
		options: [
			{
				displayName: 'Include Canceled',
				name: 'includeCanceled',
				type: 'boolean',
				default: false,
				description: 'Whether to include canceled appointments in the results',
			},
			{
				displayName: 'Patient ID',
				name: 'patientId',
				type: 'string',
				default: '',
				description: 'Restrict results to the appointments of a single patient (id do paciente)',
			},
		],
	},

	// ----- Get Occupation -----
	{
		displayName: 'From Date',
		name: 'occFrom',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getOccupation'] } },
		description:
			'Start date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'To Date',
		name: 'occTo',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getOccupation'] } },
		description:
			'End date of the search range. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'Group By',
		name: 'occGroupBy',
		type: 'options',
		default: 'month',
		options: [
			{ name: 'None', value: '' },
			{ name: 'Month', value: 'month' },
		],
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getOccupation'] } },
		description:
			'Group the results. Choose Month to aggregate the occupation by month across the date range.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForAppointments, operation: ['getOccupation'] } },
		options: [
			{
				displayName: 'Clinic Name or ID',
				name: 'businessId',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getClinics' },
				description:
					'Optionally restrict results to a single clinic (id da clínica). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
];

export async function executeAppointment(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'cancel') {
		const subscriberId = await getSubscriberId.call(this, i);
		const id = this.getNodeParameter('cancelId', i) as string;
		return clinicorpApiRequest.call(this, 'POST', '/appointment/cancel_appointment', {
			subscriber_id: subscriberId,
			id,
		});
	}

	if (operation === 'changeStatus') {
		const id = this.getNodeParameter('changeStatusId', i) as string;
		const statusId = this.getNodeParameter('statusId', i) as string;
		return clinicorpApiRequest.call(
			this,
			'GET',
			'/appointment/change_status',
			{},
			{
				id,
				status_id: statusId,
			},
		);
	}

	if (operation === 'confirm') {
		const subscriberId = await getSubscriberId.call(this, i);
		const id = this.getNodeParameter('confirmId', i) as string;
		return clinicorpApiRequest.call(this, 'POST', '/appointment/confirm_appointment', {
			subscriber_id: subscriberId,
			id,
		});
	}

	if (operation === 'create') {
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = {
			PatientName: this.getNodeParameter('patientName', i) as string,
			date: toApiDate(this.getNodeParameter('createDate', i) as string),
			fromTime: this.getNodeParameter('fromTime', i) as string,
			toTime: this.getNodeParameter('toTime', i) as string,
			Clinic_BusinessId: this.getNodeParameter('createClinicId', i) as string,
			Dentist_PersonId: this.getNodeParameter('createDentistId', i) as string,
		};

		Object.assign(
			body,
			pickMapped(additionalFields, {
				categoryColor: 'CategoryColor',
				categoryDescription: 'CategoryDescription',
				email: 'Email',
				mobilePhone: 'MobilePhone',
				patientPersonId: 'Patient_PersonId',
				procedures: 'Procedures',
				scheduleToId: 'ScheduleToId',
				scheduleToType: 'ScheduleToType',
			}),
		);

		return clinicorpApiRequest.call(this, 'POST', '/appointment/create_appointment_by_api', body);
	}

	if (operation === 'createOnlineScheduling') {
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = {
			PatientName: this.getNodeParameter('onlinePatientName', i) as string,
			date: toApiDate(this.getNodeParameter('onlineDate', i) as string),
		};

		const clinicId = this.getNodeParameter('onlineClinicId', i, '') as string;
		const dentistId = this.getNodeParameter('onlineDentistId', i, '') as string;
		if (clinicId) body.Clinic_BusinessId = clinicId;
		if (dentistId) body.Dentist_PersonId = dentistId;

		Object.assign(
			body,
			pickMapped(additionalFields, {
				alreadyPatient: 'AlreadyPatient',
				codeLink: 'CodeLink',
				email: 'Email',
				fromTime: 'fromTime',
				isOnlineScheduling: 'IsOnlineScheduling',
				mobilePhone: 'MobilePhone',
				notes: 'NotesPatient',
				otherDocumentId: 'OtherDocumentId',
				otherPhones: 'OtherPhones',
				schedulingReason: 'SchedulingReason',
				toTime: 'toTime',
				type: 'Type',
			}),
		);

		return clinicorpApiRequest.call(this, 'POST', '/appointment/create_online_scheduling', body);
	}

	if (operation === 'get') {
		const subscriberId = await getSubscriberId.call(this, i);
		const codeLink = this.getNodeParameter('getCodeLink', i) as string;
		const id = this.getNodeParameter('getId', i) as string;
		return clinicorpApiRequest.call(
			this,
			'GET',
			'/appointment/get_appointment',
			{},
			{
				subscriber_id: subscriberId,
				code_link: codeLink,
				id,
			},
		);
	}

	if (operation === 'getAvailableDays') {
		const subscriberId = await getSubscriberId.call(this, i);
		const codeLink = this.getNodeParameter('daysCodeLink', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			code_link: codeLink,
		};
		const fromDate = additionalFields.fromDate as string;
		const toDate = additionalFields.toDate as string;
		if (fromDate) qs.from = toApiDate(fromDate);
		if (toDate) qs.to = toApiDate(toDate);
		if (additionalFields.includeHolidays) qs.includeHolidays = true;
		if (additionalFields.showAvailableTimes) qs.showAvailableTimes = true;

		return clinicorpApiRequest.call(this, 'GET', '/appointment/get_avaliable_days', {}, qs);
	}

	if (operation === 'getAvailableTimes') {
		const subscriberId = await getSubscriberId.call(this, i);
		const date = this.getNodeParameter('timesDate', i) as string;
		const codeLink = this.getNodeParameter('timesCodeLink', i) as string;
		return clinicorpApiRequest.call(
			this,
			'GET',
			'/appointment/get_avaliable_times_calendar',
			{},
			{
				subscriber_id: subscriberId,
				date: toApiDate(date),
				code_link: codeLink,
			},
		);
	}

	if (operation === 'getInfo') {
		const subscriberId = await getSubscriberId.call(this, i);
		const from = this.getNodeParameter('infoFrom', i) as string;
		const to = this.getNodeParameter('infoTo', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		const businessId = additionalFields.businessId as string;
		const groupBy = additionalFields.groupBy as string;
		if (businessId) qs.business_id = businessId;
		if (groupBy) qs.group_by = groupBy;

		return clinicorpApiRequest.call(this, 'GET', '/appointment/list_info', {}, qs);
	}

	if (operation === 'getMany') {
		const subscriberId = await getSubscriberId.call(this, i);
		const from = this.getNodeParameter('listFrom', i) as string;
		const to = this.getNodeParameter('listTo', i) as string;
		const businessId = this.getNodeParameter('listClinicId', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
			businessId,
		};
		const patientId = additionalFields.patientId as string;
		if (patientId) qs.patientId = patientId;
		if (additionalFields.includeCanceled) qs.includeCanceled = true;

		return clinicorpApiRequest.call(this, 'GET', '/appointment/list', {}, qs);
	}

	if (operation === 'getManyCategories') {
		return clinicorpApiRequest.call(this, 'GET', '/appointment/list_categories');
	}

	if (operation === 'getOccupation') {
		const subscriberId = await getSubscriberId.call(this, i);
		const from = this.getNodeParameter('occFrom', i) as string;
		const to = this.getNodeParameter('occTo', i) as string;
		const groupBy = this.getNodeParameter('occGroupBy', i, '') as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const qs: IDataObject = {
			subscriber_id: subscriberId,
			from: toApiDate(from),
			to: toApiDate(to),
		};
		if (groupBy) qs.group_by = groupBy;
		const businessId = additionalFields.businessId as string;
		if (businessId) qs.business_id = businessId;

		return clinicorpApiRequest.call(this, 'GET', '/appointment/schedule_occupation', {}, qs);
	}

	if (operation === 'getStatuses') {
		const subscriberId = await getSubscriberId.call(this, i);
		return clinicorpApiRequest.call(
			this,
			'GET',
			'/appointment/status_list',
			{},
			{
				subscriber_id: subscriberId,
			},
		);
	}

	return {};
}
