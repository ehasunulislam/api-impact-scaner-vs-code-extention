import * as vscode from 'vscode';
import { scanRoutesCommand } from './commands/scanRoutes';
import { ApiImpactDecorator } from './providers/impactDecorator';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "api-imapct-scaner" is now active!');

	// regiter decorator provider
	const impactDecorator = new ApiImpactDecorator();
	context.subscriptions.push(
		vscode.window.registerFileDecorationProvider(impactDecorator)
	);

	// register command
	const scanDisoable = vscode.commands.registerCommand(
		"api-impact-scanner.scanRoutes", 
		() => scanRoutesCommand(impactDecorator)
	);

	context.subscriptions.push(scanDisoable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
