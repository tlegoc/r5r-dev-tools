import { squirrelReplicationType } from "../../squirrel";

export function getReplicationAtIndex(
	text: string,
	index: number
): squirrelReplicationType[] {
	//Check if function is preceded by #if or #endif
	const lastIf = text.lastIndexOf("#if", index);
	const lastEIf = text.lastIndexOf("#elseif", index);
	const lastEndIf = text.lastIndexOf("#endif", index);
	const nextEndIf = text.indexOf("#endif", index);
	const nextEIf = text.indexOf("#elseif", index);

	const sqRepType: squirrelReplicationType[] = [];

	if (lastIf > lastEndIf) {
		//connection?.console.log("Function is in an if statement");
		const repString = text.substring(lastIf, nextEndIf).split("#if")[1];
		if (repString.includes("SERVER"))
			sqRepType.push(squirrelReplicationType.SERVER);
		if (repString.includes("CLIENT"))
			sqRepType.push(squirrelReplicationType.CLIENT);
		if (repString.includes("UI"))
			sqRepType.push(squirrelReplicationType.UI);
		if (repString.includes("DEV"))
			sqRepType.push(squirrelReplicationType.DEV);

		return sqRepType;
	}

	return [squirrelReplicationType.DOC];
}
