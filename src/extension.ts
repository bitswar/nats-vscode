import * as vscode from 'vscode';
import { NatsCodeLensProvider } from './code-lens-provider';
import { NatsManager } from "./nats-client";

const natsManager = new NatsManager();
const outputChannel = vscode.window.createOutputChannel('NATS');

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('nats.connect', async () => {
            const url = await vscode.window.showInputBox({ prompt: 'Enter NATS server url' });
            if (url) {
                try {
                    await natsManager.connect(url);
                    vscode.window.showInformationMessage('Connected to NATS');
                } catch (error) {
                    vscode.window.showErrorMessage(`Eror while connecting to nats: ${JSON.stringify(error)}`);
                }
            }
        }),
        vscode.commands.registerCommand('nats.startSubscription', async (filePath: string, lineNumber: number) => {
            if (!natsManager.isConnected()) {
                vscode.window.showWarningMessage('Not connected to nats server.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(filePath);
            const line = document.getText().split('\n')[lineNumber - 1].trim();
            const parts = line.split(' ');
            const subject = parts[1];
            const key = `${filePath}:${lineNumber}`;
            await natsManager.startSubscription(subject, outputChannel, key);
            vscode.window.showInformationMessage(`Subscribed on subject ${subject} started`);
        }),
        vscode.commands.registerCommand('nats.stopSubscription', (filePath: string, lineNumber: number) => {
            const key = `${filePath}:${lineNumber}`;
            natsManager.stopSubscription(key);
            vscode.window.showInformationMessage('Subscription stopped');
        }),
        vscode.commands.registerCommand('nats.sendRequest', async (filePath: string, lineNumber: number) => {
            if (!natsManager.isConnected()) {
                vscode.window.showWarningMessage('Not connected to nats server.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(filePath);
            const line = document.getText().split('\n')[lineNumber - 1].trim();
            const parts = line.split(' ', 2);
            const subject = parts[1];
            const dataStart = line.indexOf('{');
            const dataEnd = line.lastIndexOf('}');
            let data = '';
            if (dataStart !== -1 && dataEnd !== -1 && dataEnd > dataStart) {
                data = line.substring(dataStart, dataEnd + 1);
            }
            const response = await natsManager.sendRequest(subject, data);
            outputChannel.appendLine(`Reply to request from ${subject}: ${response.data.toString()}`);
        }),

        vscode.commands.registerCommand('nats.publish', async (filePath: string, lineNumber: number) => {
            if (!natsManager.isConnected()) {
                vscode.window.showWarningMessage('Not connected to nats server.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(filePath);
            const line = document.getText().split('\n')[lineNumber - 1].trim();
            const parts = line.split(' ', 2);
            const subject = parts[1];
            const dataStart = line.indexOf('{');
            const dataEnd = line.lastIndexOf('}');
            let data = '';
            if (dataStart !== -1 && dataEnd !== -1 && dataEnd > dataStart) {
                data = line.substring(dataStart, dataEnd + 1);
            }
            await natsManager.publish(subject, data);
            vscode.window.showInformationMessage(`Published to ${subject}`);
        })
    );

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider({ pattern: '**/*.nats' }, new NatsCodeLensProvider(natsManager))
    );
}

export function deactivate() {
    natsManager.disconnect();
}