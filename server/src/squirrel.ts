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
	SERVER = "SERVER",
	CLIENT = "CLIENT",
	SHARED = "SHARED",
	UI = "UI"
}

export interface squirrelDocument {
	uri: string;
	globalFunctions: Set<squirrelFunc>;
	vars: Set<squirrelVar>;
	localFunctions: Set<squirrelFunc>;
	text: {
		saved: string;
		temp: string;
	},
	replication?: squirrelReplicationType;
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