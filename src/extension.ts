import * as vscode from 'vscode';
import { scanRoutesCommand } from './commands/scanRoutes';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "api-imapct-scaner" is now active!');

	const scanDisoable = vscode.commands.registerCommand(
		"api-imapct-scaner.scanRoutes", scanRoutesCommand
	);

	context.subscriptions.push(scanDisoable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
