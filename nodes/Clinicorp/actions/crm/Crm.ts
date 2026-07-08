import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';

const showOnlyForCrm = {
	resource: ['crm'],
};

export const crmDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForCrm },
		options: [
			{
				name: 'Add Lead',
				value: 'addLead',
				action: 'Add a lead',
				description: 'Sends an external lead to be added to a CRM campaign',
			},
			{
				name: 'Get Active Campaigns',
				value: 'getActiveCampaigns',
				action: 'Get active campaigns',
				description: 'Lists the active CRM campaigns',
			},
		],
		default: 'addLead',
	},

	// ----- Add Lead -----
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForCrm, operation: ['addLead'] } },
		description: 'Full name of the lead to add to the CRM campaign',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		default: '',
		displayOptions: { show: { ...showOnlyForCrm, operation: ['addLead'] } },
		description: 'Email address of the lead',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		displayOptions: { show: { ...showOnlyForCrm, operation: ['addLead'] } },
		description:
			'Phone number of the lead, including country and area code, e.g. +55 21 99999-9999. Digits only (5521999999999) is also accepted.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForCrm, operation: ['addLead'] } },
		options: [
			{
				displayName: 'Board Name',
				name: 'boardName',
				type: 'string',
				default: '',
				description:
					'Name of the CRM campaign/board to add the lead to. It must match an existing campaign name exactly (same case, spaces and accents) — run the CRM "Get Active Campaigns" operation first and copy the "Name" value. Do not invent a name: if it does not match, the lead is not attached to the campaign.',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Additional notes to attach to the lead',
			},
		],
	},
];

export async function executeCrm(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'addLead') {
		const subscriberId = await getSubscriberId.call(this, i);
		const name = this.getNodeParameter('name', i) as string;
		const email = this.getNodeParameter('email', i, '') as string;
		const phone = this.getNodeParameter('phone', i, '') as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = {
			subscriber_id: subscriberId,
			Name: name,
		};
		if (email) body.Email = email;
		if (phone) body.Phone = phone;
		if (additionalFields.boardName) body.BoardName = additionalFields.boardName;
		if (additionalFields.notes) body.Notes = additionalFields.notes;

		return clinicorpApiRequest.call(this, 'POST', '/crm/add_leads', body);
	}

	if (operation === 'getActiveCampaigns') {
		const subscriberId = await getSubscriberId.call(this, i);
		return clinicorpApiRequest.call(
			this,
			'GET',
			'/crm/list_active_campaigns',
			{},
			{
				subscriber_id: subscriberId,
			},
		);
	}

	return {};
}
