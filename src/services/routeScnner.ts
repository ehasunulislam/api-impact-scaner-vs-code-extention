import * as vscode from "vscode";
import { glob } from "glob";
import fs from "fs/promises";
import { RouteInfo } from "../types/route.type";


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


// backend route extract
export async function extractRoutes(files: string[]): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = [];
    const regex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`](.*?)['"`]/g;

    for(const file of files) {
        try{
            const content = await fs.readFile(file, "utf-8");

            let match;

            while((match = regex.exec(content)) !== null) {
                routes.push({
                    route: match[2],
                    file
                });
            }
        }
        catch {
            continue;
        }
    }

    return routes;
}

