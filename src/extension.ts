import * as vscode from 'vscode';
import { NatsCodeLensProvider } from './code-lens-provider';
import { NatsManager } from "./nats-client";

const natsManager = new NatsManager();
const globalOutputChannel = vscode.window.createOutputChannel('NATS');
let subscriptionChannels = new Map<string, vscode.OutputChannel>();
let extensionContext: vscode.ExtensionContext;


function getOutputChannelForSubject(subject: string): vscode.OutputChannel {
    let channel = subscriptionChannels.get(subject);
    if (!channel) {
        channel = vscode.window.createOutputChannel(`NATS - ${subject}`);
        subscriptionChannels.set(subject, channel);
    }
    return channel;
}

async function tryAutoConnect(context: vscode.ExtensionContext) {
    const savedUrl = context.globalState.get<string>('nats.connectionUrl');
    if (savedUrl) {
        try {
            await natsManager.connect(savedUrl);
            vscode.window.showInformationMessage(`Auto-connected to NATS: ${savedUrl}`);
        } catch (error) {
            vscode.window.showWarningMessage(`Failed to auto-connect to NATS: ${savedUrl}. ${error}`);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    extensionContext = context;
    
    tryAutoConnect(context);
    
    context.subscriptions.push(
        vscode.commands.registerCommand('nats.connect', async () => {
            const savedUrl = extensionContext.globalState.get<string>('nats.connectionUrl');
            const url = await vscode.window.showInputBox({ 
                prompt: 'Enter NATS server url',
                value: savedUrl || '',
                placeHolder: 'nats://localhost:4222'
            });
            if (url) {
                try {
                    await natsManager.connect(url);
                    await extensionContext.globalState.update('nats.connectionUrl', url);
                    vscode.window.showInformationMessage(`Connected to NATS: ${url}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Error while connecting to NATS: ${JSON.stringify(error)}`);
                }
            }
        }),
        vscode.commands.registerCommand('nats.startSubscription', async (filePath: string, lineNumber: number) => {
            if (!natsManager.isConnected()) {
                vscode.window.showWarningMessage('Not connected to nats server.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
            const line = document.getText().split('\n')[lineNumber - 1].trim();
            const parts = line.split(' ');
            const subject = parts[1];
            const key = `${filePath}:${lineNumber}`;
            const outputChannel = getOutputChannelForSubject(subject);
            await natsManager.startSubscription(subject, outputChannel, key);
            outputChannel.show();
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
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
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
            globalOutputChannel.appendLine(`[${subject}] response came : ${response}`);
            globalOutputChannel.show();
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
        }),
        vscode.commands.registerCommand('nats.disconnect', async () => {
            natsManager.disconnect();
            vscode.window.showInformationMessage('Disconnected from NATS');
        }),
        vscode.commands.registerCommand('nats.clearSavedConnection', async () => {
            await extensionContext.globalState.update('nats.connectionUrl', undefined);
            vscode.window.showInformationMessage('Saved NATS connection URL cleared');
        })
    );

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider({ pattern: '**/*.nats' }, new NatsCodeLensProvider(natsManager))
    );
}

export function deactivate() {
    natsManager.disconnect();
}