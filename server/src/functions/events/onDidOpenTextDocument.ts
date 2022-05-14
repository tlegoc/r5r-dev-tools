import { DidOpenTextDocumentParams, _Connection } from "vscode-languageserver";
import { squirrelDocument } from "../../squirrel";
import { URI } from "vscode-uri";
import * as fs from "fs";
import { validateTextDocument } from "../tools/validateTextDocument";
import { generateSquirrelDocument } from '../tools/generateSquirrelDocument';

export async function onDidOpenTextDocument(
	params: DidOpenTextDocumentParams,
	squirrelDocuments: Map<string, squirrelDocument>,
	rsonPath: URI | undefined,
	connection: _Connection
) {
	//Vscode encodes uris with a cool api but fs doesn't like it so we first have to convert it
	//We keep the original uri tho, as it is our main way to retrieve and identify files
	const uri = URI.parse(params.textDocument.uri);
	connection.console.log(
		`Document opened: ${uri.fsPath}, (vscode uri: ${uri.toString()})`
	);

	//We get the text to validate
	const text = fs.readFileSync(uri.fsPath).toString();

	//We validate the document.
	validateTextDocument(text, uri.toString(), connection);

	squirrelDocuments.set(uri.toString(), generateSquirrelDocument(text, text, uri, rsonPath, connection));
}
