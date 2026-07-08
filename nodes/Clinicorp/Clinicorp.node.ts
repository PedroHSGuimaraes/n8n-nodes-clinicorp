import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { executeResource, resourceOptions, resourceProperties } from './actions';
import { loadOptions } from './methods/loadOptions';

export class Clinicorp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Clinicorp',
		name: 'clinicorp',
		icon: { light: 'file:clinicorp.svg', dark: 'file:clinicorp.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Read and write data in Clinicorp, the dental and clinic management platform. Query estimates (orçamentos), patients, appointments (agenda), financial reports, payments, sales and conversion, procedures, professionals, clinics, CRM leads, analytics and goals; and create patients, appointments, CRM leads and purchase orders. Conventions: dates are sent as YYYY-MM-DD and times as 24-hour HH:mm; IDs (clinic, professional, status) must come from the matching list operation, never invented; the Subscriber ID is taken from the credential when the field is left empty. To book an appointment, first read availability (Clinic > Get Available Times, or Appointment > Get Available Times when using a booking Code Link), then call Appointment > Create with that exact slot. Usable as an AI Agent tool.',
		defaults: {
			name: 'Clinicorp',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'clinicorpApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: resourceOptions,
				default: 'estimate',
			},
			{
				displayName: 'Subscriber ID',
				name: 'subscriberId',
				type: 'string',
				default: '',
				description:
					'Your Clinicorp subscriber/account ID (id do Assinante), required by most operations. Leave empty to use the Default Subscriber ID set in the Clinicorp API credential.',
			},
			...resourceProperties,
		],
	};

	methods = {
		loadOptions,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				const responseData = await executeResource.call(this, resource, operation, i);
				const asArray = Array.isArray(responseData) ? responseData : [responseData];

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(asArray as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
