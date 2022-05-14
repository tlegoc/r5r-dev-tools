export function removeComments(text: string): string {
    return text.replace(/\/\/[\w\W]*?\n/g, "\n");
}