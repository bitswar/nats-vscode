import * as vscode from 'vscode';
import { NatsManager } from "./nats-client";

const natsManager = new NatsManager();

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('nats.connect', async () => {
            const url = await vscode.window.showInputBox({ prompt: 'Enter NATS server url' });
            if (url) {
                try {
                    await natsManager.connect(url);
                    vscode.window.showInformationMessage('Connected to NATS');
                } catch (error) {
                    vscode.window.showErrorMessage(`Eror while connecting to nats: ${error.message}`);
                }
            }
        }),
    );
}

export function deactivate() {
    natsManager.disconnect();
}