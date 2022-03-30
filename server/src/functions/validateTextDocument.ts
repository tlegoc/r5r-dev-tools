import { Diagnostic, _Connection } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

export async function validateTextDocument(text: string, uri: string, connection: _Connection): Promise<void> {
	// The validator creates diagnostics for all uppercase words length 2 and more
	let m: RegExpExecArray | null;

	const problems = 0;
	const diagnostics: Diagnostic[] = [];

	//Bracket validation
	//
	//
	//
	//
	/*
	let index = 0;
	let bracketCount = 0;
	const bracketIndex: number[] = [];
	while (index < text.length) {
	  index++;
	  if (text[index] == "{") {
		bracketCount++;
		bracketIndex.push(index);
	  } else if (text[index] == "}") {
		bracketCount--;
		bracketIndex.pop();
	  }
  
	  if (bracketCount < 0) break;
	}
  
	connection.console.log("Bracket delta " + bracketCount);
	connection.console.log("Bracket index length " + bracketIndex.length);
	if (bracketCount < 0) {
	  const diag: Diagnostic = {
		severity: DiagnosticSeverity.Error,
		range: {
		  start: textDocument.positionAt(index),
		  end: textDocument.positionAt(index + 1),
		},
		message: `Unwanted curly bracket at ${textDocument.positionAt(index)}.`,
		source: "ex",
	  };
  
	  diagnostics.push(diag);
	} else {
	  bracketIndex.forEach((x) => {
		const diag: Diagnostic = {
		  severity: DiagnosticSeverity.Error,
		  range: {
			start: textDocument.positionAt(x),
			end: textDocument.positionAt(x + 1),
		  },
		  message: `Unclosed bracket at ${textDocument.positionAt(x)}.`,
		  source: "ex",
		};
  
		diagnostics.push(diag);
	  });
	}*/

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: uri, diagnostics });
}
