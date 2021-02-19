const path = require('path');
module.exports = {
	entryPoints: ['./src/index.ts'],
	exclude: './src/index.js',
	out: 'docs',
	// excludePrivate: true,
	// excludeInternal: true,
	// excludeExternals: true,
	// disableSources: true,
	theme: 'minimal',
};
