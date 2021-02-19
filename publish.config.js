module.exports = {
	plugins: [
		'plugins/markdown',
		'./node_modules/better-docs/typescript',
		'./node_modules/better-docs/category',
	],
	recurseDepth: 10,
	source: {
		include: ['index.js', './src/'],
		exclude: ['./lib/utils/', './node_modules/'],
		includePattern: '.+\\.(js|ts)?$',
		excludePattern: '(^|\\/|\\\\)_',
	},
	sourceType: 'module',
	tags: {
		allowUnknownTags: true,
		dictionaries: ['jsdoc', 'closure'],
	},
	templates: {
		cleverLinks: false,
		monospaceLinks: false,
		outputSourceFiles: false,
		default: {
			outputSourceFiles: false,
		},
	},
	opts: {
		recurse: true,
		destination: './docs/',
		template: './node_modules/docdash',
		encoding: 'utf8',
		private: true,
	},
};
