import * as nats from 'nats';
import * as vscode from 'vscode';

export class NatsManager {
    private nc: nats.NatsConnection | null = null;
    private subscriptionMap = new Map<string, () => void>();

    async connect(url: string, options?: nats.ConnectionOptions) {
        this.nc = await nats.connect({ servers: [url], ...options });
    }


    disconnect() {
        if (this.nc) {
            this.nc.close();
            this.nc = null;
        }
        for (const stop of this.subscriptionMap.values()) {
            stop();
        }
        this.subscriptionMap.clear();
    }

    isConnected(): boolean {
        return this.nc !== null;
    }

    async startSubscription(subject: string, outputChannel: vscode.OutputChannel, key: string): Promise<void> {
        if (!this.nc) throw new Error('Не подключено');
        const sub = this.nc.subscribe(subject);
        const stop = () => {
            sub.unsubscribe();
            this.subscriptionMap.delete(key);
        };
        this.subscriptionMap.set(key, stop);
        (async () => {
            for await (const m of sub) {
                outputChannel.appendLine(`Получено сообщение: ${m.data.toString()}`);
            }
        })();
    }

    stopSubscription(key: string): void {
        const stop = this.subscriptionMap.get(key);
        if (stop) {
            stop();
        }
    }

    async sendRequest(subject: string, data: string): Promise<nats.Msg> {
        if (!this.nc) throw new Error('Не подключено');
        return this.nc.request(subject, data);
    }

    isSubscribed(key: string) {
        return this.subscriptionMap.has(key)
    }
}