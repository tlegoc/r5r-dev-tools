import { squirrelDocument, squirrelVarRange } from "../../squirrel";

export function getVariableRange(variableName: string, document: string): squirrelVarRange {
	const globalPattern = new RegExp(`global\\s+const\\s+\\w+\\s+${variableName}`);
	const documentPattern = new RegExp(`const\\s+\\w+\\s+${variableName}`);

	if (globalPattern.exec(document)) return squirrelVarRange.global;
	else if (documentPattern.exec(document)) return squirrelVarRange.document;
	else return squirrelVarRange.function;
}

