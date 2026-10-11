import * as vscode from "vscode";
import { glob } from "glob";
import fs from "fs/promises";
import { ImpactedFile, RouteInfo } from "../types/route.type";


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
                    method: match[1].toUpperCase(),
                    file: file
                });
            }
        }
        catch {
            continue;
        }
    }

    return routes;
}


// frontend  route extract
export async function findImpactedFrontendFiles(files: string[], backendRoutes: RouteInfo[]) {
    const impactedFile: ImpactedFile[] = [];

    for(const file of files) {
        try {
            const content = await fs.readFile(file, "utf-8");
            const matchedRoutes: RouteInfo[] = [];

            for(const routeInfo of backendRoutes) {
                const cleanRoute = routeInfo.route.replace(/:[a-zA-Z0-9]+/g, ".*");
                const routeRegex = new RegExp(`['"\`].*?\${cleanRoute}.*?['"\`]`, 'g');

                if(routeRegex.test(content)) {
                    matchedRoutes.push(routeInfo);
                }
            }

            if(matchedRoutes.length > 0) {
                impactedFile.push({
                    filePath: file,
                    affectedRoutes: matchedRoutes
                });
            }
        }
        catch {
            continue;
        }
    }

    return impactedFile;
}