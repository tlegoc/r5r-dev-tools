/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ----------------------------------------------------------------------------------*/
import {
	createConnection,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	TextDocumentSyncKind,
	InitializeResult,
	Hover,
} from "vscode-languageserver/node";

import { squirrelDocument} from "./squirrel";
import { onDidChangeTextDocument } from "./functions/onDidChangeTextDocument";
import { onDidOpenTextDocument } from "./functions/onDidOpenTextDocument";
import { onCompletion } from "./functions/onCompletion";
import { onInitialized } from "./functions/onInitialized";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

//Converted documents to squirrel architecture (uri, doc)
const squirrelDocuments: Map<string, squirrelDocument> = new Map();

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

	onInitialized(squirrelDocuments, connection);
});

//Handlers
connection.onCompletion((x) => onCompletion(x, squirrelDocuments, connection));
connection.onDidChangeTextDocument((x) => onDidChangeTextDocument(x, squirrelDocuments, connection));
connection.onDidOpenTextDocument(x => onDidOpenTextDocument(x, squirrelDocuments, connection));
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
