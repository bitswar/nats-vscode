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
        if (!this.nc) throw new Error('Not connected');
        const sub = this.nc.subscribe(subject);
        const stop = () => {
            sub.unsubscribe();
            this.subscriptionMap.delete(key);
        };
        this.subscriptionMap.set(key, stop);
        (async () => {
            for await (const m of sub) {
                outputChannel.appendLine(`Recieved message: ${m.data.toString()}`);
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
        if (!this.nc) throw new Error('Not connected');
        return this.nc.request(subject, data);
    }

    async publish(subject: string, data: string): Promise<void> {
        if (!this.nc) throw new Error('Not connected');
        this.nc.publish(subject, data);
    }

    isSubscribed(key: string) {
        return this.subscriptionMap.has(key);
    }
}