import { Diagnostic, _Connection } from "vscode-languageserver";

export async function validateTextDocument(text: string, uri: string, connection: _Connection): Promise<void> {
	// The validator creates diagnostics for all uppercase words length 2 and more
	let m: RegExpExecArray | null;

	const diagnostics: Diagnostic[] = [];

	// Send the computed diagnostics to VSCode.
	connection.console.log("Sending diagnostic results for " + uri);
	connection.sendDiagnostics({ uri: uri, diagnostics });
}
