import type { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { analyticsDescription, executeAnalytics } from './analytics/Analytics';
import { appointmentDescription, executeAppointment } from './appointment/Appointment';
import { businessDescription, executeBusiness } from './business/Business';
import { crmDescription, executeCrm } from './crm/Crm';
import { estimateDescription, executeEstimate } from './estimate/Estimate';
import { fileDescription, executeFile } from './file/File';
import { financialDescription, executeFinancial } from './financial/Financial';
import { groupDescription, executeGroup } from './group/Group';
import { migrationDescription, executeMigration } from './migration/Migration';
import { operationalDescription, executeOperational } from './operational/Operational';
import { patientDescription, executePatient } from './patient/Patient';
import { paymentDescription, executePayment } from './payment/Payment';
import { procedureDescription, executeProcedure } from './procedure/Procedure';
import { productDescription, executeProduct } from './product/Product';
import { professionalDescription, executeProfessional } from './professional/Professional';
import { salesDescription, executeSales } from './sales/Sales';
import { userDescription, executeUser } from './user/User';

// The Resource dropdown (alphabetically sorted by name).
export const resourceOptions: INodePropertyOptions[] = [
	{
		name: 'Analytics',
		value: 'analytics',
		description: 'Aggregated analytics across all clinics of the subscriber',
	},
	{
		name: 'Appointment',
		value: 'appointment',
		description: 'Appointments and the clinic agenda (schedule, availability, statuses)',
	},
	{
		name: 'Clinic',
		value: 'business',
		description: 'Clinics (business units), their chairs and available times',
	},
	{ name: 'CRM', value: 'crm', description: 'CRM leads and marketing campaigns' },
	{
		name: 'Estimate',
		value: 'estimate',
		description: 'Patient estimates / treatment plans (orçamentos)',
	},
	{ name: 'File', value: 'file', description: 'Upload files, images and documents to the system' },
	{
		name: 'Financial',
		value: 'financial',
		description: 'Financial reports: invoices, receipts, cash flow, payments and summaries',
	},
	{ name: 'Group', value: 'group', description: 'Franchise group: units and their clinics' },
	{
		name: 'Migration',
		value: 'migration',
		description: 'Data migration jobs (from file or database connection)',
	},
	{
		name: 'Operational',
		value: 'operational',
		description: 'Operational goals: sales goals and absence (no-show) goals',
	},
	{
		name: 'Patient',
		value: 'patient',
		description: 'Patients: create, look up, birthdays, appointments and estimate totals',
	},
	{
		name: 'Payment',
		value: 'payment',
		description: 'Payments and health-insurance billing claims',
	},
	{
		name: 'Procedure',
		value: 'procedure',
		description: 'Procedures from price lists and specialties',
	},
	{ name: 'Product', value: 'product', description: 'Product purchase orders' },
	{
		name: 'Professional',
		value: 'professional',
		description: 'Professionals (dentists / providers)',
	},
	{
		name: 'Sales',
		value: 'sales',
		description: 'Sales reports: estimates and conversion, revenue by specialty',
	},
	{ name: 'User', value: 'user', description: 'System users of the subscriber' },
];

// Concatenated per-resource property definitions (operations + fields).
export const resourceProperties: INodeProperties[] = [
	...analyticsDescription,
	...appointmentDescription,
	...businessDescription,
	...crmDescription,
	...estimateDescription,
	...fileDescription,
	...financialDescription,
	...groupDescription,
	...migrationDescription,
	...operationalDescription,
	...patientDescription,
	...paymentDescription,
	...procedureDescription,
	...productDescription,
	...professionalDescription,
	...salesDescription,
	...userDescription,
];

// Dispatch to the right resource implementation.
export async function executeResource(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	i: number,
): Promise<any> {
	switch (resource) {
		case 'analytics':
			return executeAnalytics.call(this, operation, i);
		case 'appointment':
			return executeAppointment.call(this, operation, i);
		case 'business':
			return executeBusiness.call(this, operation, i);
		case 'crm':
			return executeCrm.call(this, operation, i);
		case 'estimate':
			return executeEstimate.call(this, operation, i);
		case 'file':
			return executeFile.call(this, operation, i);
		case 'financial':
			return executeFinancial.call(this, operation, i);
		case 'group':
			return executeGroup.call(this, operation, i);
		case 'migration':
			return executeMigration.call(this, operation, i);
		case 'operational':
			return executeOperational.call(this, operation, i);
		case 'patient':
			return executePatient.call(this, operation, i);
		case 'payment':
			return executePayment.call(this, operation, i);
		case 'procedure':
			return executeProcedure.call(this, operation, i);
		case 'product':
			return executeProduct.call(this, operation, i);
		case 'professional':
			return executeProfessional.call(this, operation, i);
		case 'sales':
			return executeSales.call(this, operation, i);
		case 'user':
			return executeUser.call(this, operation, i);
		default:
			throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
	}
}
