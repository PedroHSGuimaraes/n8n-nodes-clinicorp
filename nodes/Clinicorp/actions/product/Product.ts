import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { clinicorpApiRequest } from '../../transport';
import { toApiDate } from '../../helpers/format';

const showOnlyForProducts = {
	resource: ['product'],
};

export const productDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForProducts },
		options: [
			{
				name: 'Create Order',
				value: 'createOrder',
				action: 'Create a purchase order',
				description: 'Creates a new purchase order for a clinic',
			},
		],
		default: 'createOrder',
	},

	// ----- Create Order -----
	{
		displayName: 'Clinic Name or ID',
		name: 'clinic',
		type: 'options',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForProducts, operation: ['createOrder'] } },
		typeOptions: { loadOptionsMethod: 'getClinics' },
		description:
			'Clinic (clínica) the purchase order belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Order Code',
		name: 'orderCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForProducts, operation: ['createOrder'] } },
		description: 'Unique code identifying the purchase order (código do pedido de compra)',
	},
	{
		displayName: 'Order Date',
		name: 'orderDate',
		type: 'dateTime',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForProducts, operation: ['createOrder'] } },
		description: 'Date the order was placed. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
	},
	{
		displayName: 'Products',
		name: 'productsUi',
		type: 'fixedCollection',
		required: true,
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Product',
		displayOptions: { show: { ...showOnlyForProducts, operation: ['createOrder'] } },
		description: 'The products (produtos) to include in the purchase order',
		options: [
			{
				name: 'product',
				displayName: 'Product',
				values: [
					{
						displayName: 'Code',
						name: 'code',
						type: 'string',
						required: true,
						default: '',
						description: 'Internal code of the product (código do produto)',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						required: true,
						default: '',
						description: 'Name of the product (nome do produto)',
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						required: true,
						default: 1,
						description: 'Quantity of the product being ordered',
					},
					{
						displayName: 'Unit Price',
						name: 'unitPrice',
						type: 'number',
						required: true,
						default: 0,
						description: 'Price per unit of the product (preço unitário)',
					},
					{
						displayName: 'Unit Of Measurement',
						name: 'unitOfMeasurement',
						type: 'string',
						required: true,
						default: '',
						description: 'Unit of measurement of the product, e.g. un, box, kg',
					},
					{
						displayName: 'Brand',
						name: 'brand',
						type: 'string',
						default: '',
						description: 'Brand of the product (marca)',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Additional description of the product',
					},
					{
						displayName: 'Expiration Date',
						name: 'expirationDate',
						type: 'dateTime',
						default: '',
						description:
							'Expiration date of the product. Only the date part (YYYY-MM-DD) is sent to Clinicorp.',
					},
					{
						displayName: 'Lot',
						name: 'lot',
						type: 'string',
						default: '',
						description: 'Lot / batch number of the product (lote)',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
						description: 'Free-form notes about the product',
					},
					{
						displayName: 'Storage Location',
						name: 'storageLocation',
						type: 'string',
						default: '',
						description: 'Where the product is stored (local de armazenamento)',
					},
					{
						displayName: 'Supplier',
						name: 'supplier',
						type: 'string',
						default: '',
						description: 'Supplier of the product (fornecedor)',
					},
				],
			},
		],
	},
];

export async function executeProduct(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'createOrder') {
		const clinic = this.getNodeParameter('clinic', i) as string;
		const orderCode = this.getNodeParameter('orderCode', i) as string;
		const orderDate = this.getNodeParameter('orderDate', i) as string;
		const productsUi = this.getNodeParameter('productsUi', i, {}) as IDataObject;

		const productItems = (productsUi.product as IDataObject[]) ?? [];
		const products = productItems.map((item) => {
			const product: IDataObject = {
				code: item.code,
				name: item.name,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				unitOfMeasurement: item.unitOfMeasurement,
			};
			if (item.description) product.description = item.description as string;
			if (item.brand) product.brand = item.brand as string;
			if (item.expirationDate) {
				product.expirationDate = toApiDate(item.expirationDate as string);
			}
			if (item.lot) product.lot = item.lot as string;
			if (item.notes) product.notes = item.notes as string;
			if (item.storageLocation) product.storageLocation = item.storageLocation as string;
			if (item.supplier) product.supplier = item.supplier as string;
			return product;
		});

		const body: IDataObject = {
			clinic,
			orderCode,
			orderDate: toApiDate(orderDate),
			products,
		};

		return clinicorpApiRequest.call(this, 'POST', '/products/orders', body);
	}

	return {};
}
