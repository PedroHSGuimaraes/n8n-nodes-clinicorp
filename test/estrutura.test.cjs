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

// Lê um workflow sem as linhas de comentário, para um comando só comentado não contar como passo.
function workflow(arquivo) {
	return ler(arquivo)
		.split('\n')
		.filter((linha) => !linha.trim().startsWith('#'))
		.join('\n');
}

// Lista todas as node-version de um workflow; o valor pode vir com aspas.
function nodeVersions(arquivo) {
	return [...workflow(arquivo).matchAll(/node-version:\s*['"]?([^\s'"]+)/g)].map((m) => m[1]);
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
		// O script compila primeiro e só então roda os testes, nesta ordem e ligados por &&.
		assert.equal(pkg.scripts.test, 'npm run build && node --test test/*.test.cjs');
	});

	it('ci.yml roda ci, lint, test e build com a node-version do publish', () => {
		const ci = workflow('.github/workflows/ci.yml');
		// Cada comando precisa ser o `run:` de um passo, não só aparecer no texto.
		for (const comando of ['npm ci', 'npm run lint', 'npm test', 'npm run build']) {
			assert.match(ci, new RegExp(`^\\s*run: ${comando}$`, 'm'), `ci.yml sem passo ${comando}`);
		}
		const doCi = nodeVersions('.github/workflows/ci.yml');
		const doPublish = nodeVersions('.github/workflows/publish.yml');
		assert.ok(doCi.length > 0);
		assert.deepEqual(new Set(doCi), new Set(doPublish));
	});
});
