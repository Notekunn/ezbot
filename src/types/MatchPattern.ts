const matchText = (pattern: String) => {
	return (text: String) => {
		const matched = text.toLowerCase() == pattern.toLowerCase();
		return {
			// pattern,
			matched,
			command: pattern,
			args: null,
		};
	};
};

const matchRegex = (pattern: RegExp) => {
	return (text: String) => {
		const matched = pattern.test(text.toString());
		if (!matched)
			return {
				// pattern,
				matched,
				command: null,
				args: null,
			};

		const [command, ...args] = text.match(pattern);
		return {
			// pattern,
			matched,
			command,
			args,
		};
	};
};
const getMatcher = (pattern: RegExp | String) => {
	if (typeof pattern === 'string') return matchText(pattern);
	if (pattern instanceof RegExp) return matchRegex(pattern);
	throw new Error('Pattern khong ho tro');
};
export default (patterns: Array<RegExp | String>) => {
	const matchers = patterns.map((e) => getMatcher(e));
	return (text: String) => {
		for (let i = 0; i < matchers.length; i++) {
			const result = matchers[i](text);
			if (result.matched) return result;
		}
		return { matched: false, command: null, args: null };
	};
};
