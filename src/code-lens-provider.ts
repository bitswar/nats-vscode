import * as vscode from 'vscode';
import { NatsManager } from './nats-client';
import { parseNatsFile } from './nats-file-parser';
;

export class NatsCodeLensProvider implements vscode.CodeLensProvider {
    constructor(private natsManager: NatsManager) {}

    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const actions = parseNatsFile(document);
        const codeLenses: vscode.CodeLens[] = [];
        for (const action of actions) {
            const range = new vscode.Range(action.lineNumber, 0, action.lineNumber, 0);
            if (action.type === 'subscribe') {
                const key = `${document.uri.fsPath}:${action.lineNumber}`;
                const isSubscribed = this.natsManager.isSubscribed(key);
                const title = isSubscribed ? 'Остановить подписку' : 'Запустить подписку';
                const command = isSubscribed ? 'nats.stopSubscription' : 'nats.startSubscription';
                const args = [document.uri.fsPath, action.lineNumber];
                codeLenses.push(new vscode.CodeLens(range, { title, command, arguments: args }));
            } else if (action.type === 'request') {
                const command: vscode.Command = {
                    title: 'Отправить запрос',
                    command: 'nats.sendRequest',
                    arguments: [document.uri.fsPath, action.lineNumber]
                };
                codeLenses.push(new vscode.CodeLens(range, command));
            }
        }
        return codeLenses;
    }
}