import * as vscode from "vscode";
import { extractRoutes, scanWorkSpaceFiles } from "../services/routeScnner";

export async function scanRoutesCommand() {
    try{
        const files = await scanWorkSpaceFiles();
        const routes = await extractRoutes(files);

        console.log("Routes Found:");
        console.log(routes);
        

        vscode.window.showInformationMessage(
            `Found ${routes.length} routes`
        );

        console.log(files);
    }
    catch(err) {
        vscode.window.showErrorMessage(
            err instanceof Error ? err.message : "Unknwon Error"
        );
    }
}