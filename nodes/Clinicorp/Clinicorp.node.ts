import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { executeResource, resourceOptions, resourceProperties } from './actions';
import { loadOptions } from './methods/loadOptions';

export class Clinicorp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Clinicorp',
		name: 'clinicorp',
		icon: { light: 'file:clinicorp.svg', dark: 'file:clinicorp.dark.svg' },
		group: ['transform'],
		// Versão 2 traz os campos guiados; a 1 segue igual para workflows salvos (ver .specs).
		version: [1, 2],
		defaultVersion: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Read and write data in Clinicorp, the dental and clinic management platform. Query estimates (orçamentos), patients, appointments (agenda), financial reports, payments, sales and conversion, procedures, professionals, clinics, CRM leads, analytics and goals; and create patients, appointments, CRM leads and purchase orders. Conventions: dates are sent as YYYY-MM-DD and times as 24-hour HH:mm; IDs (clinic, professional, status) must come from the matching list operation, never invented; the Subscriber ID is read automatically from the credential, so it is never an input. To book an appointment, first read availability (Clinic > Get Available Times, or Appointment > Get Available Times when using a booking Code Link), then call Appointment > Create with that exact slot. Usable as an AI Agent tool.',
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
				// Erro da API continua NodeApiError (o n8n mostra o código HTTP e a resposta); só
				// marcamos o item. O n8n reaproveita a causa quando o erro já é um NodeApiError.
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
						itemIndex: i,
					});
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
