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
 * Resolve the Subscriber ID for the current item.
 *
 * Precedence: the node's Subscriber ID field (if filled) → the Default Subscriber
 * ID stored in the credential. Throws a clear error when neither is available.
 */
export async function getSubscriberId(this: IExecuteFunctions, i: number): Promise<string> {
	const fromParam = (this.getNodeParameter('subscriberId', i, '') as string).trim();
	if (fromParam) {
		return fromParam;
	}

	const credentials = await this.getCredentials('clinicorpApi');
	const fromCredential = ((credentials?.subscriberId as string) ?? '').trim();
	if (fromCredential) {
		return fromCredential;
	}

	throw new NodeOperationError(
		this.getNode(),
		'No Subscriber ID provided. Fill the "Subscriber ID" field on the node, or set a "Default Subscriber ID" in the Clinicorp API credential.',
		{ itemIndex: i },
	);
}
