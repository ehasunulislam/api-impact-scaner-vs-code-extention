import * as vscode from "vscode";
import { extractRoutes, findImpactedFrontendFiles, scanWorkSpaceFiles } from "../services/routeScnner";
import { ApiImpactDecorator } from "../providers/impactDecorator";

export async function scanRoutesCommand(decorator: ApiImpactDecorator) {
    try{
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Scaning API impacts on Frontend...",
            cancellable: false
        },  async(progress) => {
            const files = await scanWorkSpaceFiles();
            const backendRoutes = await extractRoutes(files);

            // find the Frontend updated file
            const impactedFiles = await findImpactedFrontendFiles(files, backendRoutes);

            // return the file's path within array
            const afftectedPaths = impactedFiles.map((f) => {
                return f.filePath;
            });

            // send the highlight within the decorator
            decorator.updatedImpactedFiles(afftectedPaths);

            vscode.window.showInformationMessage(
                `Scan Completed! Found ${backendRoutes.length} backend routes. ${impactedFiles.length} frontend files might need updates.`
            );
        }
        );
    }
    catch(err) {
        vscode.window.showErrorMessage(
            err instanceof Error ? err.message : "Unknwon Error"
        );
    }
}