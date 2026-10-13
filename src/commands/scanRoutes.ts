import * as vscode from "vscode";
import { extractRoutes, findImpactedFrontendFiles, scanWorkSpaceFiles } from "../services/routeScnner";
import { ApiImpactDecorator } from "../providers/impactDecorator";

export async function scanRoutesCommand(decorator: ApiImpactDecorator) {
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Scanning API impacts across Workspace...",
            cancellable: false
        }, async (progress) => {
            const files = await scanWorkSpaceFiles();
            
            const backendRoutes = await extractRoutes(files);
            
            if (backendRoutes.length === 0) {
                vscode.window.showWarningMessage("No backend routes found. Make sure your backend folder is added to the workspace.");
                return;
            }

            const impactedFiles = await findImpactedFrontendFiles(files, backendRoutes);
            const affectedPaths = impactedFiles.map(f => f.filePath);
            
            decorator.updatedImpactedFiles(affectedPaths);

            vscode.window.showInformationMessage(
                `Scan Complete! Found ${backendRoutes.length} backend routes. ${impactedFiles.length} frontend files need verification.`
            );
        });

    } catch (err) {
        vscode.window.showErrorMessage(
            err instanceof Error ? err.message : "Unknown Error"
        );
    }
}