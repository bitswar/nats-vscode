import * as vscode from 'vscode';
export interface NatsAction {
    type: 'subscribe' | 'request' | 'publish';
    subject: string;
    data?: string;
    lineNumber: number;
}

export function parseNatsFile(document: vscode.TextDocument): NatsAction[] {
    const actions: NatsAction[] = [];
    const lines = document.getText().split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('SUBSCRIBE')) {
            const parts = line.split(' ');
            if (parts.length >= 2) {
                actions.push({ type: 'subscribe', subject: parts[1], lineNumber: i });
            }
        } else if (line.startsWith('REQUEST')) {
            const parts = line.split(' ', 2);
            if (parts.length >= 2) {
                const subject = parts[1];
                const dataStart = line.indexOf('{');
                const dataEnd = line.lastIndexOf('}');
                let data: string | undefined;
                if (dataStart !== -1 && dataEnd !== -1 && dataEnd > dataStart) {
                    data = line.substring(dataStart, dataEnd + 1);
                }
                actions.push({ type: 'request', subject, data, lineNumber: i });
            }
        } else if (line.startsWith('PUBLISH')) {
            const parts = line.split(' ', 2);
            if (parts.length >= 2) {
                const subject = parts[1];
                const dataStart = line.indexOf('{');
                const dataEnd = line.lastIndexOf('}');
                let data: string | undefined;
                if (dataStart !== -1 && dataEnd !== -1 && dataEnd > dataStart) {
                    data = line.substring(dataStart, dataEnd + 1);
                }
                actions.push({ type: 'publish', subject, data, lineNumber: i });
            }
        }
    }
    return actions;
}