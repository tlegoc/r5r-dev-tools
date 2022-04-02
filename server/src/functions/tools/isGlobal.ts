export function isGlobal(name: string, document: string): boolean {
	const patternf = new RegExp(`global\\s+function\\s+${name}`).exec(document) ? true : false;
	//const patternv = new RegExp(`global\\s+const\\s+[\\w]+\\s+${name}`).exec(document) ? true : false;

	return patternf;
}

