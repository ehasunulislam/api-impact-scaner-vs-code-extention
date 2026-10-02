import * as vscode from "vscode";
import { scanWorkSpaceFiles } from "../services/routeScnner";

export async function scanRoutesCommand() {
    try{
        const files = await scanWorkSpaceFiles();

        vscode.window.showInformationMessage(
            `Found ${files.length} JS/TS files`
        );

        console.log(files);
    }
    catch(err) {
        vscode.window.showErrorMessage(
            err instanceof Error ? err.message : "Unknwon Error"
        );
    }
}