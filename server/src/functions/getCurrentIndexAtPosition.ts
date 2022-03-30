import { Position } from "vscode-languageserver";

export function getCurrentIndexAtPosition(position: Position, text: string): number {
    let index = 0;
    let currentLine = 0;
    let currentChar = 0;
    while (currentLine < position.line || currentChar < position.character) {
        if (text[index] == "\n") {
            currentLine++;
            currentChar = 0;
        } else currentChar++;

        index++;
    }

    return index;
}