import * as vscode from 'vscode';
import { NatsCodeLensProvider } from './code-lens-provider';
import { NatsManager } from "./nats-client";

const natsManager = new NatsManager();
const outputChannel = vscode.window.createOutputChannel('NATS'); // Добавь канал вывода

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
                vscode.window.showWarningMessage('Не подключено к серверу NATS.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(filePath);
            const line = document.getText().split('\n')[lineNumber].trim();
            const parts = line.split(' ');
            const subject = parts[1];
            const key = `${filePath}:${lineNumber}`;
            await natsManager.startSubscription(subject, outputChannel, key);
            vscode.window.showInformationMessage(`Подписка на ${subject} запущена`);
        }),
        vscode.commands.registerCommand('nats.stopSubscription', (filePath: string, lineNumber: number) => {
            const key = `${filePath}:${lineNumber}`;
            natsManager.stopSubscription(key);
            vscode.window.showInformationMessage('Подписка остановлена');
        }),
        vscode.commands.registerCommand('nats.sendRequest', async (filePath: string, lineNumber: number) => {
            if (!natsManager.isConnected()) {
                vscode.window.showWarningMessage('Не подключено к серверу NATS.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(filePath);
            const line = document.getText().split('\n')[lineNumber].trim();
            const parts = line.split(' ', 2);
            const subject = parts[1];
            const dataStart = line.indexOf('{');
            const dataEnd = line.lastIndexOf('}');
            let data = '';
            if (dataStart !== -1 && dataEnd !== -1 && dataEnd > dataStart) {
                data = line.substring(dataStart, dataEnd + 1);
            }
            const response = await natsManager.sendRequest(subject, data);
            outputChannel.appendLine(`Ответ на запрос ${subject}: ${response.data.toString()}`);
        }),
        // Новая команда для публикации
        vscode.commands.registerCommand('nats.publish', async (filePath: string, lineNumber: number) => {
            if (!natsManager.isConnected()) {
                vscode.window.showWarningMessage('Не подключено к серверу NATS.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(filePath);
            const line = document.getText().split('\n')[lineNumber].trim();
            const parts = line.split(' ', 2);
            const subject = parts[1];
            const dataStart = line.indexOf('{');
            const dataEnd = line.lastIndexOf('}');
            let data = '';
            if (dataStart !== -1 && dataEnd !== -1 && dataEnd > dataStart) {
                data = line.substring(dataStart, dataEnd + 1);
            }
            await natsManager.publish(subject, data);
            vscode.window.showInformationMessage(`Сообщение опубликовано на ${subject}`);
        })
    );

    // Регистрация CodeLens провайдера
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider({ pattern: '**/*.nats' }, new NatsCodeLensProvider(natsManager))
    );
}

export function deactivate() {
    natsManager.disconnect();
}