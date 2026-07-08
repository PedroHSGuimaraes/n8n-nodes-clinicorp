import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest } from '../../transport';

const showOnlyForFiles = {
	resource: ['file'],
};

export const fileDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForFiles },
		options: [
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload a file',
				description: 'Uploads files, images and documents to the system',
			},
		],
		default: 'upload',
	},

	// ----- Upload -----
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		displayOptions: { show: { ...showOnlyForFiles, operation: ['upload'] } },
		description: 'Public URL of the file to upload',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForFiles, operation: ['upload'] } },
		options: [
			{
				displayName: 'Local File',
				name: 'localFile',
				type: 'string',
				default: '',
				description: 'Path or reference to a local file to upload',
			},
			{
				displayName: 'Patient ID',
				name: 'patientId',
				type: 'string',
				default: '',
				description: 'ID of the patient (id do paciente) the file belongs to',
			},
			{
				displayName: 'Patient Name',
				name: 'patientName',
				type: 'string',
				default: '',
				description: 'Name of the patient (nome do paciente) the file belongs to',
			},
			{
				displayName: 'Response Webhook URL',
				name: 'responseWebhookUrl',
				type: 'string',
				default: '',
				description: 'URL that Clinicorp will call back with the upload result',
			},
		],
	},
];

export async function executeFile(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'upload') {
		const url = this.getNodeParameter('url', i, '') as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const item: IDataObject = {};
		if (additionalFields.responseWebhookUrl) {
			item.ResponseWebhookUrl = additionalFields.responseWebhookUrl as string;
		}
		if (url) item.Url = url;
		if (additionalFields.localFile) item.LocalFile = additionalFields.localFile as string;
		if (additionalFields.patientName) item.PatientName = additionalFields.patientName as string;
		// `PatinetId` is intentionally misspelled to match the exact Clinicorp API field name.
		if (additionalFields.patientId) item.PatinetId = additionalFields.patientId as string;

		const body: IDataObject[] = [item];

		return clinicorpApiRequest.call(this, 'POST', '/file/upload', body);
	}

	return {};
}
