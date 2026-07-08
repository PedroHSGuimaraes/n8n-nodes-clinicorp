import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest, getSubscriberId } from '../../transport';

const showOnlyForMigration = {
	resource: ['migration'],
};

export const migrationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForMigration },
		options: [
			{
				name: 'Create From Connection',
				value: 'createFromConnection',
				action: 'Create a migration from a database connection',
				description: 'Starts a data migration by connecting directly to an external database',
			},
			{
				name: 'Create From File',
				value: 'createFromFile',
				action: 'Create a migration from a file',
				description: 'Starts a data migration from a previously uploaded database file',
			},
			{
				name: 'Get Upload URL',
				value: 'getUploadUrl',
				action: 'Get a migration upload URL',
				description: 'Returns a URL to upload the migration database file',
			},
		],
		default: 'createFromConnection',
	},

	// ----- Create From Connection -----
	{
		displayName: 'Database Type',
		name: 'connDatabaseType',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromConnection'] } },
		description: 'Type of the source database, e.g. MySQL, SQLServer, Postgres',
	},
	{
		displayName: 'Migration Type',
		name: 'connMigrationType',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromConnection'] } },
		description:
			'Type of migration to perform for the source system, as agreed with Clinicorp support, e.g. Full or Partial. Do not guess this value — confirm it with Clinicorp before running a migration.',
	},
	{
		displayName: 'Host',
		name: 'host',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromConnection'] } },
		description: 'Hostname or IP address of the source database server',
	},
	{
		displayName: 'Database',
		name: 'connDatabase',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromConnection'] } },
		description: 'Name of the source database to migrate from',
	},
	{
		displayName: 'User',
		name: 'user',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromConnection'] } },
		description: 'Username used to authenticate against the source database',
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromConnection'] } },
		description: 'Password used to authenticate against the source database',
	},

	// ----- Create From File -----
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromFile'] } },
		description: 'Name of the previously uploaded migration database file',
	},
	{
		displayName: 'Database Type',
		name: 'fileDatabaseType',
		type: 'string',
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromFile'] } },
		description: 'Type of the source database contained in the file, e.g. MySQL, SQLServer',
	},
	{
		displayName: 'Migration Type',
		name: 'fileMigrationType',
		type: 'string',
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['createFromFile'] } },
		description:
			'Type of migration to perform for the uploaded file, as agreed with Clinicorp support, e.g. Full or Partial. Do not guess this value — confirm it with Clinicorp before running a migration.',
	},

	// ----- Get Upload URL -----
	{
		displayName: 'File Name',
		name: 'uploadFileName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForMigration, operation: ['getUploadUrl'] } },
		description: 'Name of the migration database file that will be uploaded',
	},
];

export async function executeMigration(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'createFromConnection') {
		const subscriberId = await getSubscriberId.call(this, i);
		const databaseType = this.getNodeParameter('connDatabaseType', i) as string;
		const migrationType = this.getNodeParameter('connMigrationType', i) as string;
		const host = this.getNodeParameter('host', i) as string;
		const database = this.getNodeParameter('connDatabase', i) as string;
		const user = this.getNodeParameter('user', i) as string;
		const password = this.getNodeParameter('password', i, '') as string;

		const body: IDataObject[] = [
			{
				SubscriptionId: subscriberId,
				DataAccess: {
					DatabaseType: databaseType,
					MigrationType: migrationType,
					Host: host,
					Password: password,
					Database: database,
					User: user,
				},
			},
		];

		return clinicorpApiRequest.call(this, 'POST', '/migration/connection', body);
	}

	if (operation === 'createFromFile') {
		const subscriberId = await getSubscriberId.call(this, i);
		const fileName = this.getNodeParameter('fileName', i) as string;
		const databaseType = this.getNodeParameter('fileDatabaseType', i, '') as string;
		const migrationType = this.getNodeParameter('fileMigrationType', i, '') as string;

		const dataAccess: IDataObject = {
			FileName: fileName,
		};
		if (databaseType) dataAccess.DatabaseType = databaseType;
		if (migrationType) dataAccess.MigrationType = migrationType;

		const body: IDataObject[] = [
			{
				SubscriptionId: subscriberId,
				DataAccess: dataAccess,
			},
		];

		return clinicorpApiRequest.call(this, 'POST', '/migration/file', body);
	}

	if (operation === 'getUploadUrl') {
		const subscriberId = await getSubscriberId.call(this, i);
		const fileName = this.getNodeParameter('uploadFileName', i) as string;

		const body: IDataObject[] = [
			{
				SubscriptionId: subscriberId,
				DataAccess: {
					FileName: fileName,
				},
			},
		];

		return clinicorpApiRequest.call(this, 'POST', '/migration/file/upload', body);
	}

	return {};
}
