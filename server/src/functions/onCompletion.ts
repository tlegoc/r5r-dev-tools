import {
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	_Connection,
} from "vscode-languageserver";
import { squirrelDocument } from "../squirrel";
import { getCurrentFunction } from "./tools/getCurrentFunction";
import { getIndexAtPosition } from "./tools/getIndexAtPosition";
import { getReplicationAtIndex } from "./tools/getReplicationAtIndex";

export function onCompletion(
	_textDocumentPosition: TextDocumentPositionParams,
	squirrelDocuments: Map<string, squirrelDocument>,
	connection: _Connection
): CompletionItem[] {
	//Result
	const items: CompletionItem[] = [];

	//We get the document
	const sqDoc = squirrelDocuments.get(_textDocumentPosition.textDocument.uri);
	//Leave if doc invalid
	if (!sqDoc) return [];

	// CURRENT CONTEXT
	//
	//
	const currentIndex = getIndexAtPosition(
		_textDocumentPosition.position,
		sqDoc.text.temp
	);
	const currentReplication = getReplicationAtIndex(
		sqDoc.text.temp,
		currentIndex
	);
	const currentFunc = getCurrentFunction(sqDoc, currentIndex);
	const lastChar = sqDoc.text.temp[Math.max(currentIndex - 1, 0)];

	if (lastChar === ".") {
		//Dot completion
		//Get last token

		return items;
	} else {
		//Normal completion

		//FUNCTIONS
		//
		//

		//Global functions
		squirrelDocuments.forEach((tempDoc) => {
			tempDoc.globalFunctions.forEach((func) => {
				//Avoid calling server code inside client code, etc
				if (
					currentReplication != undefined &&
					currentReplication != func.replication
				)
					return;

				const item: CompletionItem = {
					label: func.name,
					kind: CompletionItemKind.Function,
					insertText: func.name,
					detail: "(global function): " + func.name,
					documentation: `Returns: ${
						func.returnType
					}.\nFound at index ${func.body.start} in ${
						sqDoc.uri.split("/")[tempDoc.uri.split("/").length - 1]
					}.${
						func.replication
							? "\nReplication: " + func.replication + "."
							: ""
					}`,
				};
				items.push(item);
			});

			tempDoc.vars?.forEach((svar) => {
				const item: CompletionItem = {
					label: svar.name,
					kind: CompletionItemKind.Variable,
					detail: "(local variable): " + svar.name,
					documentation: `Type: ${svar.type}.\nFound at index ${svar.declaration}.`,
				};
				items.push(item);
			});
		});

		//Local functions
		sqDoc.localFunctions.forEach((func) => {
			//Avoid calling server code inside client code, etc
			if (
				(currentReplication != undefined &&
					currentReplication != func.replication) ||
				(currentReplication == undefined &&
					sqDoc.replication != func.replication)
			)
				return;

			const item: CompletionItem = {
				label: func.name,
				kind: CompletionItemKind.Function,
				insertText: func.name,
				detail: "(local function): " + func.name,
				documentation: `Returns: ${func.returnType}.\nFound at index ${
					func.body.start
				}.${
					func.replication
						? "\nReplication: " + func.replication + "."
						: ""
				}`,
			};
			items.push(item);
		});

		// VARIABLES
		//
		//

		//We get vars that are usable inside this function (local vars)
		currentFunc?.body.variables.forEach((svar) => {
			if (svar.declaration > currentIndex) return;

			const item: CompletionItem = {
				label: svar.name,
				kind: CompletionItemKind.Variable,
				detail: "(local variable): " + svar.name,
				documentation: `Type: ${svar.type}.\nFound at index ${svar.declaration}.`,
			};

			items.push(item);
		});

		//We get parameter vars
		currentFunc?.parameters.forEach((svar) => {
			if (svar.declaration > currentIndex) return;

			const item: CompletionItem = {
				label: svar.name,
				kind: CompletionItemKind.Variable,
				detail: "(local variable): " + svar.name,
				documentation: `Type: ${svar.type}.\nFound at index ${svar.declaration}.`,
			};

			items.push(item);
		});

		return items;
	}
}
