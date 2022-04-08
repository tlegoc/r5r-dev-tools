import { _Connection } from "vscode-languageserver";
import {
	squirrelDocument,
	squirrelFunc,
	squirrelVar,
	squirrelVarRange,
} from "../../squirrel";
import { getReplicationAtIndex } from "./getReplicationAtIndex";
import { getVariableRange } from "./getVariableRange";
import { isGlobal } from "./isGlobal";
import { removeComments } from "./removeComments";

//Yes it's long and complicated
//You dont know how long it took me
const functionPattern = /(?<returnType>\w+)(?<spaceone> +function +)(?<functionName>\w+)(?<spacetwo> *\()(?<params>.*)(?<spacethree>\)[\s\S]*?)/g;
const variablePattern = /(?<varType>[\w.]+)\s+(?<varName>\w+)\s*=/g;
const parameterPattern = /(void +?functionref\([\w, ]+\) +?(?<funcRefName>\w+))|(?<varType>[\w]+)\s+(?<varName>\w+)/g;


export function generateSquirrelDocument(text_temp: string, text_saved: string, uri: string, connection: _Connection | undefined = undefined) {
	//We generate functions based on shown document, not saved
	const text = removeComments(text_temp);
	let [globalFunctions, localFunctions] = [new Set<squirrelFunc>(), new Set<squirrelFunc>()];
	let vars = new Set<squirrelVar>();
	
	if (text.length > 45000) {
		connection?.console.log("File too big, skipping function and var gen");
	} else {
		[globalFunctions, localFunctions] = generateFunctions(text);
		//Weird conversion trick to filter a set
		//We filter vars that aren't in a function
		vars = new Set(
			[...generateVars(text)].filter((v) => v.range != squirrelVarRange.function)
		);
	}


	

	//We generate the document
	const sqDoc: squirrelDocument = {
		uri: uri,
		globalFunctions: globalFunctions,
		localFunctions: localFunctions,
		vars: vars,
		text: {
			saved: removeComments(text_saved),
			temp: removeComments(text_temp),
		}
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



function generateFunctions(text: string): [Set<squirrelFunc>, Set<squirrelFunc>] {
	//We create the sets
	const globalFunctions: Set<squirrelFunc> = new Set();
	const localFunctions: Set<squirrelFunc> = new Set();

	let functionCount = 0;
	let m: RegExpExecArray | null;
	//Execute the pattern to find functions
	while ((m = functionPattern.exec(text)) && functionCount < 100) {
		functionCount++;

		if (!m.groups) continue;

		// FUNCTION START END
		//
		//
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


		// PARAMETERS
		//
		//
		const params = m.groups.params;
		const paramsList: Set<squirrelVar> = new Set();

		//Find parameters that can be accessed as variables
		let m2: RegExpExecArray | null;
		while ((m2 = parameterPattern.exec(params))) {
			
			if (!m2.groups) continue;

			
			const type = m2.groups.varType;
			const name = m2.groups.varName;
			const funcRefName = m2.groups.funcRefName;

			const isFuncRef = funcRefName != undefined;

			//connection?.console.log(`Found param ${name} of type ${type}`);
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

		// GET REPLICATION
		//
		//
		const replication = getReplicationAtIndex(text, m.index);

		// FUNCTION GENERATION
		//
		//
		const func: squirrelFunc = {
			name: m.groups.functionName,
			returnType: m.groups.returnType,
			parameters: paramsList,
			replication: replication,
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


		//Add it to the set
		if (isGlobal(func.name, text)) globalFunctions.add(func);
		else localFunctions.add(func);
	}

	return [globalFunctions, localFunctions];
}
