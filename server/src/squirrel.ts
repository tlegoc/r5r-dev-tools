export interface squirrelFunc {
	name: string;
	parameters: Set<squirrelVar>;
	returnType: string;
	documentation?: string;
	replication?: squirrelReplicationType;
    body: { 
		start: number;
		end: number;
		content?: string;
		variables: Set<squirrelVar>;
	};
}

export enum squirrelReplicationType {
	SERVER,
	CLIENT,
	SHARED,
	UI
}

export interface squirrelDocument {
	uri: string;
	globalFunctions: Set<squirrelFunc>;
	vars: Set<squirrelVar>;
	localFunctions: Set<squirrelFunc>;
	text: string;
}

export interface squirrelVar {
	type: string;
	name: string;
	declaration: number;
	range: squirrelVarRange;
}

export enum squirrelVarRange {
	global,
	document,
	function
}