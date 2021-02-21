const matchText = (pattern: string) => {
	return (text: string) => {
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
	return (text: string) => {
		const matched = pattern.test(text);
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
const getMatcher = (pattern: RegExp | string) => {
	if (typeof pattern === 'string') return matchText(pattern);
	if (pattern instanceof RegExp) return matchRegex(pattern);
	throw new Error('Pattern khong ho tro');
};
export default (patterns: Array<RegExp | string>) => {
	const matchers = patterns.map((e) => getMatcher(e));
	return (text: string) => {
		for (let i = 0; i < matchers.length; i++) {
			const result = matchers[i](text);
			if (result.matched) return result;
		}
		return { matched: false, command: null, args: null };
	};
};
