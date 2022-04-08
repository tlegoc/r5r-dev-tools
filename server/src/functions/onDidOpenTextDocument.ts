import { DidOpenTextDocumentParams, _Connection } from "vscode-languageserver";
import { squirrelDocument } from "../squirrel";
import { URI } from "vscode-uri";
import * as fs from "fs";
import { validateTextDocument } from "./tools/validateTextDocument";
import { generateSquirrelDocument } from './tools/generateSquirrelDocument';

export async function onDidOpenTextDocument(
	params: DidOpenTextDocumentParams,
	squirrelDocuments: Map<string, squirrelDocument>,
	connection: _Connection
) {
	//Vscode encodes uris with a cool api but fs doesn't like it so we first have to convert it
	//We keep the original uri tho, as it is our main way to retrieve and identify files
	const uri_fs = URI.parse(params.textDocument.uri).fsPath;
	const uri_vscode = params.textDocument.uri;
	connection.console.log(
		`Document opened: ${uri_fs}, (vscode uri: ${uri_vscode})`
	);

	//We get the text to validate
	const text = fs.readFileSync(uri_fs).toString();

	//We validate the document.
	validateTextDocument(text, uri_vscode, connection);

	squirrelDocuments.set(uri_vscode, generateSquirrelDocument(text, text, uri_vscode, connection));
}
