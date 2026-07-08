import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ClinicorpApi implements ICredentialType {
	name = 'clinicorpApi';

	displayName = 'Clinicorp API';

	icon = { light: 'file:clinicorp.svg', dark: 'file:clinicorp.dark.svg' } as const;

	documentationUrl = 'https://sistema.clinicorp.com/api-docs/';

	properties: INodeProperties[] = [
		{
			displayName: 'API User (Username)',
			name: 'apiUser',
			type: 'string',
			default: '',
			required: true,
			description:
				'Your Clinicorp API user (the "Usuário API"). In Clinicorp, open Gerenciar Assinatura → Acesso Externo e Integrações → Integrações, and copy the "Usuário API". It is sent as the Basic Auth username.',
		},
		{
			displayName: 'API Token (Password)',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your Clinicorp API token (the "Token API"), found next to the API user under Gerenciar Assinatura → Acesso Externo e Integrações → Integrações. It is sent as the Basic Auth password.',
		},
		{
			displayName: 'Default Subscriber ID',
			name: 'subscriberId',
			type: 'string',
			default: '',
			description:
				'Your Clinicorp subscriber/account ID (id do Assinante). Most operations require it. Set it here once and it is used automatically whenever the Subscriber ID field is left empty on the node.',
		},
	];

	// Clinicorp uses HTTP Basic Auth: username = API user, password = API token.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.apiUser}}',
				password: '={{$credentials.apiToken}}',
			},
		},
	};

	// Validates the credentials against a lightweight endpoint that needs no extra parameters.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.clinicorp.com/rest/v1',
			url: '/professional/list_all_professionals',
		},
	};
}
