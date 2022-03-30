import { _Connection } from "vscode-languageserver";
import {
	squirrelDocument,
	squirrelFunc,
	squirrelVar,
	squirrelVarRange,
} from "../squirrel";
import { getVariableRange } from "./getVariableRange";
import { isGlobal } from "./isGlobal";

//Yes it's long and complicated
const functionPattern =
	/(?<returnType>\w+)(?<spaceone> +function +)(?<functionName>\w+)(?<spacetwo> *\()(?<params>.*)(?<spacethree>\)[\s\S]*?)/g;
const variablePattern = /(?<varType>[\w.]+)\s+(?<varName>\w+)\s*=/g;
//You dont know how much time this took to write
const parameterPattern = /(void +?functionref\([\w, ]+\) +?(?<funcRefName>\w+))|(?<varType>[\w]+)\s+(?<varName>\w+)/g;

export function generateSquirrelDocument(
	text: string,
	uri: string,
	connection: _Connection | undefined = undefined
) {

	
	if (text.length > 45000) {
		connection?.console.log("File too big, skipping");
		throw new Error(`File too big, ${text.length}/${45000}`);
	}

	const [globalFunctions, localFunctions] = generateFunctions(text, connection);

	
	//Weird conversion trick to filter a set
	//We filter vars that aren't in a function
	const vars = new Set(
		[...generateVars(text)].filter((v) => v.range != squirrelVarRange.function)
	);

	//We generate the document
	const sqDoc: squirrelDocument = {
		uri: uri,
		globalFunctions: globalFunctions,
		localFunctions: localFunctions,
		vars: vars,
		text: text,
	};

	return sqDoc;
}



function generateVars(text: string): Set<squirrelVar> {
	const vars: Set<squirrelVar> = new Set();

	let m: RegExpExecArray | null;

	let variableCount = 0;
	//Execute the pattern to find vars
	while ((m = variablePattern.exec(text)) && variableCount < 200) {
		variableCount++;

		//If we don't have a group, we skip
		if (!m.groups) continue;

		//We generate the variable
		const svar: squirrelVar = {
			name: m.groups.varName.trim(),
			declaration: m.index,
			type: m.groups.varType.trim(),
			range: getVariableRange(m.groups.varName, text),
		};

		//We add it to the set
		vars.add(svar);
	}

	//We return the set
	return vars;
}



function generateFunctions(
	text: string,
	connection: _Connection | undefined = undefined
): [Set<squirrelFunc>, Set<squirrelFunc>] {
	//We create the sets
	const globalFunctions: Set<squirrelFunc> = new Set();
	const localFunctions: Set<squirrelFunc> = new Set();

	let functionCount = 0;
	let m: RegExpExecArray | null;
	//Execute the pattern to find functions
	while ((m = functionPattern.exec(text)) && functionCount < 100) {
		functionCount++;

		if (!m.groups) continue;

		//Find the start and end of the function
		let bracketCount = -1;
		let end = m.index;
		while ((bracketCount == -1 || bracketCount > 0) && bracketCount < 200) {
			const c = text[++end];
			if (c == "{") {
				if (bracketCount == -1) bracketCount = 0;
				bracketCount++;
			} else if (c == "}") {
				bracketCount--;
				++end;
			}
		}


		const params = m.groups.params;
		const paramsList: Set<squirrelVar> = new Set();

		let m2: RegExpExecArray | null;
		while ((m2 = parameterPattern.exec(params))) {
			
			if (!m2.groups) continue;

			
			const type = m2.groups.varType;
			const name = m2.groups.varName;
			const funcRefName = m2.groups.funcRefName;

			const isFuncRef = funcRefName != undefined;

			connection?.console.log(`Found param ${name} of type ${type}`);
			if (isFuncRef) {
				const svar: squirrelVar = {
					name: funcRefName,
					type: "functionRef",
					declaration: m.index,
					range: squirrelVarRange.function
				};

				paramsList.add(svar);
			}
			else {
				const svar: squirrelVar = {
					name: name,
					type: type,
					declaration: m.index,
					range: squirrelVarRange.function
				};

				paramsList.add(svar);
			}

		}


		const func: squirrelFunc = {
			name: m.groups.functionName,
			returnType: m.groups.returnType,
			parameters: paramsList,
			body: {
				start: m.index,
				end: end,
				content: text.substring(m.index, end),
				variables: new Set( //Weird filter trick again to keep only variables in the function
					[...generateVars(text.substring(m.index, end))].filter(
						(v) => v.range == squirrelVarRange.function
					)
				),
			},
		};

		if (isGlobal(func.name, text)) globalFunctions.add(func);
		else localFunctions.add(func);
	}

	return [globalFunctions, localFunctions];
}
