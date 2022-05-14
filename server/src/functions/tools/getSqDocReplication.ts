import { squirrelReplicationType } from "../../squirrel";
import * as fs from "fs";
import { URI } from "vscode-uri";
import { _Connection } from "vscode-languageserver";
import { removeComments } from "./removeComments";

export function getSqDocReplication(sqDocPath: URI, rsonPath: URI | undefined, connection: _Connection | undefined): squirrelReplicationType[] {
	if (!rsonPath) return [
		squirrelReplicationType.CLIENT,
		squirrelReplicationType.SERVER,
		squirrelReplicationType.DEV,
		squirrelReplicationType.UI,
	];

	const localURI = sqDocPath.fsPath.replace(rsonPath.fsPath.replace(/[\w_-]+\.[\w_-]+\b/g, ""), "");

	connection?.console.log(`localURI: ${localURI}`);

	//Find where is the file definition located
    const pattern = new RegExp(`When:(?:(?!When:|${localURI})[\\s\\S])*${localURI}`, "g");
	//Extract replication string
	const getRepPattern = /When:\s*"(?<replication>[SERV\s|CLINTUD&()]+?)"/g;

	connection?.console.log("Searching for replication for: " + sqDocPath);
	
	const rsonContent = removeComments(fs.readFileSync(rsonPath.fsPath, "utf8"));

	const sqDocReplication: squirrelReplicationType[] = [];

	let m: RegExpExecArray | null;
	if ((m = pattern.exec(rsonContent))) {
		if (!m.groups) return [
			squirrelReplicationType.SERVER,
			squirrelReplicationType.CLIENT,
			squirrelReplicationType.DEV,
			squirrelReplicationType.UI
		];

		const replication = getRepPattern.exec(m.toString())?.groups?.replication;

		if (!replication) return sqDocReplication;

		if (replication.includes("SERVER")) sqDocReplication.push(squirrelReplicationType.SERVER);
		if (replication.includes("CLIENT")) sqDocReplication.push(squirrelReplicationType.CLIENT);
		if (replication.includes("UI")) sqDocReplication.push(squirrelReplicationType.UI);
		if (replication.includes("DEV")) sqDocReplication.push(squirrelReplicationType.DEV);

		return sqDocReplication;
	}

	return [
		squirrelReplicationType.SERVER,
		squirrelReplicationType.CLIENT,
		squirrelReplicationType.DEV,
		squirrelReplicationType.UI
	];
}
