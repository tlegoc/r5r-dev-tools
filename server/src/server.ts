/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ----------------------------------------------------------------------------------*/
import {
	createConnection,
	ProposedFeatures,
	InitializeParams,
	CompletionItem,
	TextDocumentSyncKind,
	InitializeResult,
} from "vscode-languageserver/node";

import { squirrelDocument} from "./squirrel";
import { onDidChangeTextDocument } from "./functions/events/onDidChangeTextDocument";
import { onDidOpenTextDocument } from "./functions/events/onDidOpenTextDocument";
import { onCompletion } from "./functions/events/onCompletion";
import { onInitialized } from "./functions/events/onInitialized";
import { onDidSaveTextDocument } from "./functions/events/onDidSaveTextDocument";
import { URI } from "vscode-uri";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

//Converted documents to squirrel architecture (uri, doc)
const squirrelDocuments: Map<string, squirrelDocument> = new Map();
let rsonPath: URI | undefined;

//Variables
//
//
//
//let hasConfigurationCapability = false;
//let hasWorkspaceFolderCapability = false;
//let hasDiagnosticRelatedInformationCapability = false;

// INITIALIZATION
//
//
//
connection.onInitialize((params: InitializeParams) => {
	//const capabilities = params.capabilities;
//
	//// Does the client support the `workspace/configuration` request?
	//// If not, we fall back using global settings.
	//hasConfigurationCapability = !!(
	//	capabilities.workspace && !!capabilities.workspace.configuration
	//);
	//hasWorkspaceFolderCapability = !!(
	//	capabilities.workspace && !!capabilities.workspace.workspaceFolders
	//);
	//hasDiagnosticRelatedInformationCapability = !!(
	//	capabilities.textDocument &&
	//	capabilities.textDocument.publishDiagnostics &&
	//	capabilities.textDocument.publishDiagnostics.relatedInformation
	//);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true,
			},
		},
	};
	//if (hasWorkspaceFolderCapability) {
	//	result.capabilities.workspace = {
	//		workspaceFolders: {
	//			supported: true,
	//		},
	//	};
	//}
	return result;
});

// INITIALIZATION FINISHED
//
//
//
connection.onInitialized(() => {
	//if (hasConfigurationCapability) {
	//	// Register for all configuration changes.
	//	connection.client.register(
	//		DidChangeConfigurationNotification.type,
	//		undefined
	//	);
	//}
	//if (hasWorkspaceFolderCapability) {
	//	connection.workspace.onDidChangeWorkspaceFolders((_event) => {
	//		connection.console.log("Workspace folder change event received.");
	//	});
	//}

	onInitialized(squirrelDocuments, rsonPath, connection);
});

//Handlers
connection.onCompletion((x) => onCompletion(x, squirrelDocuments, connection));
connection.onDidChangeTextDocument((x) => onDidChangeTextDocument(x, squirrelDocuments, rsonPath, connection));
connection.onDidSaveTextDocument(x => onDidSaveTextDocument(x, squirrelDocuments, rsonPath, connection));
connection.onDidOpenTextDocument(x => onDidOpenTextDocument(x, squirrelDocuments, rsonPath, connection));
connection.onDidChangeConfiguration((change) => {
	// Revalidate all open text documents
	/*
    const sqDoc = generateSquirrelDocument(doc);
    squirrelDocuments.set(doc.uri, sqDoc);
    */
});
//Not useful to put this outside
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	return item;
});

// Listen on the connection
connection.listen();
