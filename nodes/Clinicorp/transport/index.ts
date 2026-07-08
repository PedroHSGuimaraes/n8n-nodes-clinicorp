import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export const CLINICORP_BASE_URL = 'https://api.clinicorp.com/rest/v1';

type ClinicorpContext = IExecuteFunctions | ILoadOptionsFunctions;

/**
 * Make a single authenticated request to the Clinicorp REST v1 API.
 * Authentication (HTTP Basic) is injected by the `clinicorpApi` credential.
 */
export async function clinicorpApiRequest(
	this: ClinicorpContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | IDataObject[] = {},
	qs: IDataObject = {},
): Promise<any> {
	const options: IHttpRequestOptions = {
		method,
		baseURL: CLINICORP_BASE_URL,
		url: endpoint,
		qs,
		body,
		json: true,
	};

	const hasBody = Array.isArray(body) ? body.length > 0 : Object.keys(body).length > 0;
	if (!hasBody) {
		delete options.body;
	}
	if (!Object.keys(qs).length) {
		delete options.qs;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'clinicorpApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Read the Subscriber ID (id do Assinante) from the `clinicorpApi` credential.
 * It is never a node parameter, so it can't be left out or guessed.
 */
export async function getSubscriberId(this: IExecuteFunctions, i: number): Promise<string> {
	const credentials = await this.getCredentials('clinicorpApi');
	const subscriberId = ((credentials?.subscriberId as string) ?? '').trim();
	if (subscriberId) {
		return subscriberId;
	}

	throw new NodeOperationError(
		this.getNode(),
		'No Subscriber ID found. Open the Clinicorp API credential and fill in the "Subscriber ID" field.',
		{ itemIndex: i },
	);
}
