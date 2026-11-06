/**
 * Ajuda a declarar um parâmetro em duas versões do node (1 e 2) sem repetir a definição.
 *
 * Por que existe: o plano manda a versão 1 manter nome e tipo de todo parâmetro (workflow salvo
 * não pode quebrar) e a versão 2 trocar o formato de poucos campos. Um parâmetro do tipo
 * `collection` não aceita `displayOptions` nas opções internas, então a coleção inteira é
 * declarada duas vezes com o mesmo `name`: uma só para `@version` 1 e outra só para 2 em diante.
 */
import type { INodeProperties } from 'n8n-workflow';

/** Condição de `@version` que vale só para a versão 1. */
const ONLY_VERSION_1 = [1];
/** Condição de `@version` que vale da versão 2 em diante. */
const FROM_VERSION_2 = [{ _cnd: { gte: 2 } }];

/** Copia a propriedade trocando só a condição de `@version`. */
function forVersions(
	property: INodeProperties,
	versions: Array<number | { _cnd: { gte: number } }>,
): INodeProperties {
	return {
		...property,
		displayOptions: {
			...property.displayOptions,
			show: { ...property.displayOptions?.show, '@version': versions },
		},
	};
}

/**
 * Para cada propriedade escolhida por `shouldSplit`, devolve duas cópias: a original presa à
 * versão 1 e a variante de `toVersion2` presa à versão 2 em diante. As demais passam sem mudança.
 */
export function splitByVersion(
	properties: INodeProperties[],
	shouldSplit: (property: INodeProperties) => boolean,
	toVersion2: (property: INodeProperties) => INodeProperties,
): INodeProperties[] {
	return properties.flatMap((property) =>
		shouldSplit(property)
			? [forVersions(property, ONLY_VERSION_1), forVersions(toVersion2(property), FROM_VERSION_2)]
			: [property],
	);
}

/** Troca uma opção (campo interno) de uma coleção, achada pelo `name`, mantendo as demais. */
export function replaceOption(
	collection: INodeProperties,
	name: string,
	replacement: Partial<INodeProperties>,
): INodeProperties {
	return {
		...collection,
		options: (collection.options as INodeProperties[]).map((option) =>
			option.name === name ? ({ ...option, ...replacement } as INodeProperties) : option,
		),
	};
}
