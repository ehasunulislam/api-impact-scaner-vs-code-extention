import * as vscode from "vscode";
import { glob } from "glob";

export async function scanWorkSpaceFiles() {
    const workSpaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workSpaceFolder) {
        throw new Error("No workspace opened");
    }

    const file = await glob("**/*.{js,jsx,ts,tsx}", {
        cwd: workSpaceFolder.uri.fsPath,
        ignore: ["node_modules/**", ".next/**", "dist/**"],
        absolute: true
    });

    return file;
}