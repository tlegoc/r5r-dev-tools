import { squirrelReplicationType } from "../../squirrel";

export function getReplicationAtIndex(text: string, index: number): squirrelReplicationType | undefined{
    
		
	//Check if function is preceded by #if or #endif
	const lastIf = text.lastIndexOf("#if", index);
	const lastEndIf = text.lastIndexOf("#endif", index);
	let replication: squirrelReplicationType | undefined;
	if (lastIf > lastEndIf) {
		//connection?.console.log("Function is in an if statement");
		const repString = text.split("#if")[1].split(' ')[1];
		if (repString.includes("SERVER"))       return squirrelReplicationType.SERVER;
		else if (repString.includes("CLIENT"))  return squirrelReplicationType.CLIENT;
		else if (repString.includes("UI"))      return squirrelReplicationType.UI;
		else if (repString.includes("SHARED"))  return squirrelReplicationType.SHARED;
	}
}