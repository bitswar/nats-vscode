import * as vscode from 'vscode';
import { NatsManager } from './nats-client';
import { parseNatsFile } from './nats-file-parser';

export class NatsCodeLensProvider implements vscode.CodeLensProvider {
    constructor(private natsManager: NatsManager) { }

    provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeLens[]> {
        const actions = parseNatsFile(document);
        const codeLenses: vscode.CodeLens[] = [];

        for (const action of actions) {
            const range = new vscode.Range(action.lineNumber, 0, action.lineNumber, 0);
            if (action.type === 'subscribe') {
                const key = `${document.fileName}_${action.lineNumber + 1}`;
                const isSubscribed = this.natsManager.isSubscribed(key);
                const title = isSubscribed ? 'Unsubscribe' : 'Subscribe';
                const command = isSubscribed ? 'nats.stopSubscription' : 'nats.startSubscription';
                const args = [document.fileName, action.lineNumber + 1];
                codeLenses.push(new vscode.CodeLens(range, { title, command, arguments: args }));
            } else if (action.type === 'request') {
                const command: vscode.Command = {
                    title: 'Send request',
                    command: 'nats.sendRequest',
                    arguments: [document.fileName, action.lineNumber + 1]
                };
                codeLenses.push(new vscode.CodeLens(range, command));
            }
            else if (action.type === 'publish') {
                const command: vscode.Command = {
                    title: 'Publish',
                    command: 'nats.publish',
                    arguments: [document.fileName, action.lineNumber + 1]
                };
                codeLenses.push(new vscode.CodeLens(range, command));
            }
        }
        return codeLenses as vscode.ProviderResult<vscode.CodeLens[]>;
    }

    resolveCodeLens(
        codeLens: vscode.CodeLens,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeLens> {
        const document = vscode.window.activeTextEditor?.document;
        if (!document) return undefined;

        const lineNumber = codeLens.range.start.line;
        const line = document.lineAt(lineNumber).text.trim();

        if (line.startsWith('SUBSCRIBER')) {
            const parts = line.split(' ');
            const subject = parts[1];
            const key = `${document.fileName}_${lineNumber + 1}`;
            const isSubscribed = this.natsManager.isSubscribed(key);
            codeLens.command = {
                title: isSubscribed ? 'Unsubscribe' : 'Subscribe',
                command: isSubscribed ? 'nats.stopSubscription' : 'nats.startSubscription',
                arguments: [document.fileName, lineNumber + 1]
            };
        } else if (line.startsWith('REQUESTER')) {
            codeLens.command = {
                title: 'send request',
                command: 'nats.sendRequest',
                arguments: [document.fileName, lineNumber + 1]
            };
        } else if (line.startsWith('PUBLISHE')) {
            codeLens.command = {
                title: 'Publish',
                command: 'nats.publish',
                arguments: [document.fileName, lineNumber + 1]
            };
        }

        return codeLens as vscode.ProviderResult<vscode.CodeLens>;
    }
}