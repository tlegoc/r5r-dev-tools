export const functionHeader = /(?<returnType>void|vector|float|bool)(?<spaceone> +function +)(?<functionName>\w+)(?<spacetwo> *\()(?<params>.*)(?<spacethree>\)[\s\S]*?)/g;

//Old (working) ones (no body, no recursivity, etc)
// *(global +)?(void|vector|float) +(function) +\w+\((( *\w+ +\w+ *)?|( *\w+ +\w+ *,)+( *\w+ +\w+ *))\)
//(?<returnType>void|vector|float|bool) +function +(?<functionName>\w+) *\((?<params>.*)\)
// not working (?<body>{(?:[^{}]+|(?&body))*})