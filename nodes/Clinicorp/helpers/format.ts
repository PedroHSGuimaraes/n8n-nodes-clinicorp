import type { IDataObject } from 'n8n-workflow';

/**
 * Convert an n8n dateTime value (ISO string) to the YYYY-MM-DD string that most
 * Clinicorp endpoints expect for `from`/`to`/`date` parameters. Returns '' for
 * empty input so callers can skip the parameter.
 */
export function toApiDate(value: string): string {
	if (!value) return '';
	return new Date(value).toISOString().slice(0, 10);
}

/**
 * Convert an n8n dateTime value to the compact YYYYMMDD string used by a few
 * Clinicorp endpoints (e.g. business/list_available_times).
 */
export function toCompactDate(value: string): string {
	if (!value) return '';
	return new Date(value).toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Copy only the defined, non-empty values from `source` into a new object,
 * remapping keys via `map` (n8n field name → Clinicorp API field name).
 * Handy for building request bodies/query strings from collection fields.
 */
export function pickMapped(source: IDataObject, map: Record<string, string>): IDataObject {
	const out: IDataObject = {};
	for (const [from, to] of Object.entries(map)) {
		const value = source[from];
		if (value !== undefined && value !== null && value !== '') {
			out[to] = value;
		}
	}
	return out;
}
