/**
 * Testes de estrutura do pacote (S1 e S5 do plano node-cli-campos-v2).
 *
 * Eles leem os arquivos do repositório (package.json, lock, workflows) e o `dist`,
 * porque o risco aqui é a configuração derivar do padrão do node-cli 0.55.5 sem
 * ninguém notar. Cada teste protege uma regra do plano e falha se ela mudar.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const raiz = path.resolve(__dirname, '..');
const ler = (relativo) => fs.readFileSync(path.join(raiz, relativo), 'utf8');
const pkg = JSON.parse(ler('package.json'));

// Compara versões semver simples (maior.menor.patch) sem depender de pacote externo.
function maiorOuIgual(versao, minima) {
	const a = versao.split('.').map(Number);
	const b = minima.split('.').map(Number);
	for (let i = 0; i < 3; i++) {
		if (a[i] !== b[i]) return a[i] > b[i];
	}
	return true;
}

// Extrai a node-version de um workflow; o valor pode vir com aspas.
function nodeVersion(arquivo) {
	const achou = ler(arquivo).match(/node-version:\s*['"]?([^\s'"]+)/);
	return achou ? achou[1] : undefined;
}

describe('S1 toolchain do node-cli', () => {
	it('build gera node, credencial e ícones', () => {
		// O build tem de ser o oficial; antes era `tsc && gulp build:icons`.
		assert.equal(pkg.scripts.build, 'n8n-node build');
		for (const arquivo of [
			'dist/nodes/Clinicorp/Clinicorp.node.js',
			'dist/credentials/ClinicorpApi.credentials.js',
			'dist/nodes/Clinicorp/clinicorp.svg',
			'dist/nodes/Clinicorp/clinicorp.dark.svg',
			'dist/credentials/clinicorp.svg',
			'dist/credentials/clinicorp.dark.svg',
		]) {
			assert.ok(fs.existsSync(path.join(raiz, arquivo)), `falta ${arquivo}`);
		}
	});

	it('package.json segue o padrão do node-cli', () => {
		assert.equal(pkg.scripts.lint, 'n8n-node lint');
		assert.equal(pkg.n8n.strict, true);
		assert.equal(pkg.devDependencies['@n8n/node-cli'], '0.55.5');
		// Dependência de runtime é proibida em community node verificado.
		assert.equal('dependencies' in pkg, false);
		assert.equal(JSON.stringify(pkg).includes('gulp'), false);
		assert.equal(fs.existsSync(path.join(raiz, 'gulpfile.js')), false);
		assert.equal(pkg.devDependencies['n8n-workflow'], '^2.46.5');
		assert.equal(pkg.peerDependencies['n8n-workflow'], '*');
		// O lock tem de resolver 2.46.5 ou mais nova (a tag latest do npm parou em 2.16.0).
		const lock = JSON.parse(ler('package-lock.json'));
		const versao = lock.packages['node_modules/n8n-workflow'].version;
		assert.ok(maiorOuIgual(versao, '2.46.5'), `lock resolve ${versao}`);
	});

	it('npm test compila e roda os testes', () => {
		assert.match(pkg.scripts.test, /npm run build/);
		assert.match(pkg.scripts.test, /node --test test\/\*\.test\.cjs/);
	});

	it('ci.yml roda ci, lint, test e build com a node-version do publish', () => {
		const ci = ler('.github/workflows/ci.yml');
		for (const comando of ['npm ci', 'npm run lint', 'npm test', 'npm run build']) {
			assert.ok(ci.includes(comando), `ci.yml sem ${comando}`);
		}
		assert.equal(nodeVersion('.github/workflows/ci.yml'), nodeVersion('.github/workflows/publish.yml'));
	});
});
