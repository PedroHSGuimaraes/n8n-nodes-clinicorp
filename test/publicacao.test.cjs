/**
 * Testes de lançamento da 1.2.0 (S5 do plano node-cli-campos-v2): metadados do pacote,
 * changelog, README completo e workflow de publicação stage-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const raiz = path.resolve(__dirname, '..');
const ler = (relativo) => fs.readFileSync(path.join(raiz, relativo), 'utf8');
const pkg = JSON.parse(ler('package.json'));

describe('S5 lançamento 1.2.0', () => {
	it('metadados da 1.2.0 e changelog', () => {
		assert.equal(pkg.version, '1.2.0');
		assert.deepEqual(pkg.funding, {
			type: 'individual',
			url: 'https://buymeacoffee.com/qTny0AzFXS',
		});
		// Sem esse script o npm publicaria sem a checagem do n8n-node prerelease.
		assert.equal(pkg.scripts.prepublishOnly, 'n8n-node prerelease');
		assert.match(ler('CHANGELOG.md'), /^## 1\.2\.0\b/m);
	});

	it('README segue o padrão completo', () => {
		const readme = ler('README.md');
		// Selo de apoio logo abaixo da introdução, antes do índice.
		const selo = readme.indexOf('Buy_Me_a_Coffee');
		const indice = readme.indexOf('[Instalação](#');
		assert.ok(selo > -1 && indice > selo, 'selo de apoio antes do índice');
		assert.ok(readme.includes('https://buymeacoffee.com/qTny0AzFXS'));

		// Cada seção do padrão, na ordem; o emoji do título é ignorado.
		const secoes = [
			'Funcionalidades',
			'Instalação',
			'Credenciais',
			'Nós e Operações',
			'Usar como Tool de Agente de IA',
			'Exemplos',
			'Desenvolvimento',
			'Compatibilidade',
			'Recursos',
			'Publicação',
			'Versões',
			'Suporte',
			'Apoie o projeto',
			'Licença',
		];
		const titulos = [...readme.matchAll(/^## (.+)$/gm)].map((m) => m[1].replace(/^\S+\s/, ''));
		let ultimo = -1;
		for (const secao of secoes) {
			const posicao = titulos.findIndex((t, i) => i > ultimo && t.trim() === secao);
			assert.ok(posicao > ultimo, `seção "${secao}" ausente ou fora de ordem`);
			ultimo = posicao;
		}
	});

	it('publish.yml publica por stage com RELEASE_MODE', () => {
		const publish = ler('.github/workflows/publish.yml');
		assert.ok(publish.includes('npx -y npm@12.2.2 stage publish --provenance --access public'));
		assert.match(publish, /RELEASE_MODE: 'true'/);
		assert.ok(publish.includes('NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}'));
		assert.match(publish, /^\s*workflow_dispatch:/m);
		// Publicar só quando a tag bate com a versão do package.json.
		assert.ok(publish.includes('v${PACKAGE_VERSION}'));
	});
});
