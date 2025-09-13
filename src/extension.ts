import * as vscode from 'vscode';
import { NatsCodeLensProvider } from './code-lens-provider';
import { NatsManager } from "./nats-client";
import { parseNatsFile } from './nats-file-parser';

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
            const actions = parseNatsFile(document);
            const action = actions.find(a => a.lineNumber === lineNumber - 1 && a.type === 'subscribe');
            if (!action) {
                vscode.window.showErrorMessage('Could not find SUBSCRIBE action on this line');
                return;
            }
            const key = `${filePath}:${lineNumber}`;
            const outputChannel = getOutputChannelForSubject(action.subject);
            await natsManager.startSubscription(action.subject, outputChannel, key);
            outputChannel.show();
            vscode.window.showInformationMessage(`Subscribed on subject ${action.subject} started`);
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
            const actions = parseNatsFile(document);
            const action = actions.find(a => a.lineNumber === lineNumber - 1 && a.type === 'request');
            if (!action) {
                vscode.window.showErrorMessage('Could not find REQUEST action on this line');
                return;
            }
            const response = await natsManager.sendRequest(action.subject, action.data || '');
            globalOutputChannel.appendLine(`[${action.subject}] response came : ${response}`);
            globalOutputChannel.show();
        }),

        vscode.commands.registerCommand('nats.publish', async (filePath: string, lineNumber: number) => {
            if (!natsManager.isConnected()) {
                vscode.window.showWarningMessage('Not connected to nats server.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
            const actions = parseNatsFile(document);
            const action = actions.find(a => a.lineNumber === lineNumber - 1 && a.type === 'publish');
            if (!action) {
                vscode.window.showErrorMessage('Could not find PUBLISH action on this line');
                return;
            }
            await natsManager.publish(action.subject, action.data || '');
            vscode.window.showInformationMessage(`Published to ${action.subject}`);
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