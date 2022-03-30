import { _Connection } from "vscode-languageserver";
import { squirrelDocument, squirrelFunc } from "../squirrel";

export function getCurrentFunction(
	sqDoc: squirrelDocument,
	index: number,
	connection: _Connection | undefined = undefined
): squirrelFunc | undefined {

	let returnedFunc: squirrelFunc | undefined = undefined;
	
	sqDoc.globalFunctions.forEach((func) => {
		connection?.console.log("func.name: " + func.name + ", i: " + index + ", func.body.start: " + func.body.start + ", func.body.end: " + func.body.end);
		if (index >= func.body.start && index <= func.body.end) returnedFunc =  func;
	});

	sqDoc.localFunctions.forEach((func) => {
		connection?.console.log("func.name: " + func.name + ", i: " + index + ", func.body.start: " + func.body.start + ", func.body.end: " + func.body.end);
		if (index >= func.body.start && index <= func.body.end) returnedFunc = func;
	});

	return returnedFunc;
}
