import * as vscode from 'vscode';

export class ApiImpactDecorator implements vscode.FileDecorationProvider {
    private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[]> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
    readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[]> = this._onDidChangeFileDecorations.event;

    // how many file are impacted and return thier set
    private impactedFilePath: Set<string> = new Set();

    // update the impacted file list
    public updatedImpactedFiles(files: string[]) {
        this.impactedFilePath = new Set(files);
        this._onDidChangeFileDecorations.fire(Array.from(this.impactedFilePath).map((f) => {
            return(
                vscode.Uri.file(f)
            );
        }));
    }

    provideFileDecoration(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FileDecoration> {
        if(this.impactedFilePath.has(uri.fsPath)) {
            return {
                badge: "⚠",
                tooltip: "This file uses a backend route that might be modified",
                color: new vscode.ThemeColor("list.warningForeground")
            };
        }
        return undefined;
    }
}