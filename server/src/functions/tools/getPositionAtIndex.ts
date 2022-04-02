import { Position } from "vscode-languageserver";

export function getPositionAtIndex(index: number, text: string): Position {
    //Get the position at given index in the text
    let line = 0;
    let character = 0;
    for (let i = 0; i < index; i++) {
        if (text[i] === '\n') {
            line++;
            character = 0;
        }
        else {
            character++;
        }
    }
    return { line, character };
}