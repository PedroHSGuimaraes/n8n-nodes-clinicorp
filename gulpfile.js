const path = require('path');
const { task, src, dest } = require('gulp');

// Copy node/credential icons (.png/.svg) and node codex files (.node.json)
// into dist, preserving folder structure.
task('build:icons', copyAssets);

function copyAssets() {
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg,json}');
	const nodeDestination = path.resolve('dist', 'nodes');
	src(nodeSource, { base: 'nodes' }).pipe(dest(nodeDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');
	return src(credSource, { base: 'credentials' }).pipe(dest(credDestination));
}
