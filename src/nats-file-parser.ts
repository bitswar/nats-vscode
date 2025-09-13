import { randomUUID } from 'crypto';
import * as vscode from 'vscode';

export interface NatsAction {
    type: 'subscribe' | 'request' | 'publish';
    subject: string;
    data?: string;
    lineNumber: number;
}

function generateRandomId(): string {
    return randomUUID();
}

function processRandomIdInData(data: string): string {
    return data.replace(/randomId\(\)/g, () => `"${generateRandomId()}"`);
}

function extractData(lines: string[], startLineIndex: number): { data: string | undefined, endLineIndex: number } {
    const startLine = lines[startLineIndex].trim();
    
    const dataStart = startLine.indexOf('{');
    if (dataStart !== -1) {
        const dataEnd = startLine.lastIndexOf('}');
        if (dataEnd !== -1 && dataEnd > dataStart) {
            const rawData = startLine.substring(dataStart, dataEnd + 1);
            return { data: processRandomIdInData(rawData), endLineIndex: startLineIndex };
        }
        
        let jsonLines = [startLine.substring(dataStart)];
        let braceCount = 1;
        let currentLineIndex = startLineIndex;
        
        while (braceCount > 0 && currentLineIndex < lines.length - 1) {
            currentLineIndex++;
            const currentLine = lines[currentLineIndex];
            jsonLines.push(currentLine);
            
            for (const char of currentLine) {
                if (char === '{') {braceCount++;}
                if (char === '}') {braceCount--;}
            }
        }
        
        if (braceCount === 0) {
            const rawData = jsonLines.join('\n');
            return { data: processRandomIdInData(rawData), endLineIndex: currentLineIndex };
        }
    }
    
    const stringStart = startLine.indexOf('"');
    if (stringStart !== -1) {
        const stringEnd = startLine.indexOf('"', stringStart + 1);
        if (stringEnd !== -1) {
            const stringData = startLine.substring(stringStart, stringEnd + 1);
            return { data: stringData, endLineIndex: startLineIndex };
        }
    }
    
    let currentLineIndex = startLineIndex;
    while (currentLineIndex < lines.length - 1) {
        currentLineIndex++;
        const currentLine = lines[currentLineIndex].trim();
        
        if (currentLine === '') {
            continue;
        }
        
        if (currentLine.startsWith('"')) {
            const stringEnd = currentLine.indexOf('"', 1);
            if (stringEnd !== -1) {
                const stringData = currentLine.substring(0, stringEnd + 1);
                return { data: stringData, endLineIndex: currentLineIndex };
            }
        }
        
        if (currentLine.startsWith('{')) {
            let jsonLines = [currentLine];
            let braceCount = 1;
            let jsonStartIndex = currentLineIndex;
            
            while (braceCount > 0 && currentLineIndex < lines.length - 1) {
                currentLineIndex++;
                const nextLine = lines[currentLineIndex];
                jsonLines.push(nextLine);
                
                for (const char of nextLine) {
                    if (char === '{') {braceCount++;}
                    if (char === '}') {braceCount--;}
                }
            }
            
            if (braceCount === 0) {
                const rawData = jsonLines.join('\n');
                return { data: processRandomIdInData(rawData), endLineIndex: currentLineIndex };
            }
        }
        
        if (currentLine.startsWith('SUBSCRIBE') || currentLine.startsWith('REQUEST') || currentLine.startsWith('PUBLISH')) {
            break;
        }
    }
    
    return { data: undefined, endLineIndex: startLineIndex };
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
                const { data, endLineIndex } = extractData(lines, i);
                actions.push({ type: 'request', subject, data, lineNumber: i });
                i = endLineInde;
            }
        } else if (line.startsWith('PUBLISH')) {
            const parts = line.split(' ', 2);
            if (parts.length >= 2) {
                const subject = parts[1];
                const { data, endLineIndex } = extractData(lines, i);
                actions.push({ type: 'publish', subject, data, lineNumber: i });
                i = endLineInde;
            }
        }
    }
    return actions;
}