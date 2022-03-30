import { Diagnostic, DiagnosticSeverity, _Connection } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getIndexAtPosition } from "./getIndexAtPosition";
import { getPositionAtIndex } from "./getPositionAtIndex";

export async function validateTextDocument(text: string, uri: string, connection: _Connection): Promise<void> {
	// The validator creates diagnostics for all uppercase words length 2 and more
	let m: RegExpExecArray | null;

	const problems = 0;
	const diagnostics: Diagnostic[] = [];

	//Make sure the document closes opened brackets
	if (text.length > 0) {
		let openedBrackets = 0;
		const indexes1: number[] = [];
		const indexes2: number[] = [];
		for (let i = 0; i < text.length; i++) {
			if (text[i] === '{') {
				openedBrackets++;
				indexes1.push(i);
				indexes2.pop();
			}
			else if (text[i] === '}') {
				openedBrackets--;
				indexes1.pop();
				indexes2.pop();
			}
		}
		if (openedBrackets > 0) {
			diagnostics.push({
				severity: DiagnosticSeverity.Error,
				range: {
					start: getPositionAtIndex(indexes1[0], text),
					end: getPositionAtIndex(indexes1[0] + 1, text),
				},
				message: `Closing brackets are missing`
			});
		} else if (openedBrackets < 0) {
			diagnostics.push({
				severity: DiagnosticSeverity.Error,
				range: {
					start: getPositionAtIndex(indexes2[0], text),
					end: getPositionAtIndex(indexes2[0] + 1, text),
				},
				message: `Opening brackets are missing`
			});
		}
	}

	// Send the computed diagnostics to VSCode.
	connection.console.log("Sending diagnostic results for " + uri);
	connection.sendDiagnostics({ uri: uri, diagnostics });
}
