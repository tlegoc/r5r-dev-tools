import { _Connection } from "vscode-languageserver";
import { squirrelDocument } from "../squirrel";
import { URI } from "vscode-uri";
import * as fs from "fs";
import { generateSquirrelDocument } from "./tools/generateSquirrelDocument";

export async function onInitialized(
	squirrelDocuments: Map<string, squirrelDocument>,
	connection: _Connection
) {
	connection.console.log("Initializing squirrelDocs");


	const startTime = new Date().getTime();


	//We get the folders we work on
	const workspaceFolders = await connection.workspace.getWorkspaceFolders();

	//We convert them to a list of string
	const folders = workspaceFolders?.map((x) => x.uri);

	//For each folder in our project, we process every gnut/nut document.
	//Don't ask why, I wanted to make global functions work so I have to
	//do this mess
	folders?.forEach(async (folder) => {
		connection.console.log("Finding files in: " + folder);
		const files = findAllFilesInFolder(URI.parse(folder), connection);
		connection.console.log(files.length + " files found");

		connection.console.log("Generating documentation...");

		let n = 1;
		files.forEach(async (file) => {
			//connection.console.log(`Generating documentation for ${file} (${n++})`);
			connection.console.log(`${n++}/${files.length}`);
			try {
				const text = fs.readFileSync(URI.parse(file).fsPath, "utf8");
				squirrelDocuments.set(file, generateSquirrelDocument(text, file));
			} catch (error) {
				connection.console.log("Error creating squirrel Document: " + error);
			}
		});

		connection.console.log(`Done in ${new Date().getTime() - startTime}ms`);
	});
}

function findAllFilesInFolder(path: URI, connection: _Connection): string[] {
	let result: string[] = [];

	//connection.console.log("Anazlysing: " + path.toString());

	try {
		const filesFolders = fs.readdirSync(path.fsPath);
		filesFolders.forEach((fileFolder) => {
			if (fileFolder.includes("node_modules")) return;
			const fullpath = path.toString() + "/" + fileFolder;

			//If it is a gnut file we return it.
			if (fileFolder.includes(".gnut") || fileFolder.includes(".nut"))
				result.push(fullpath);
			//Else it's a folder so we open it
			else if (!fileFolder.includes("."))
				result = result.concat(
					findAllFilesInFolder(URI.parse(fullpath), connection)
				);
		});
	} catch (error) {
		//connection.console.log("Error opening dir: " + error);
	}

	return result;
}
