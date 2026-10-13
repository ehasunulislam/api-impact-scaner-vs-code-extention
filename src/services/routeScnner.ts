import * as vscode from "vscode";
import fs from "fs/promises";
import * as path from "path";
import { RouteInfo, ImpactedFile } from "../types/route.type";

/**
 * ওয়ার্কস্পেসের ওপেন থাকা ফোল্ডারের লাইভ পাথ থেকে ডাইনামিকালি সব ফাইল খুঁজে বের করা
 */
export async function scanWorkSpaceFiles(): Promise<string[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error("No workspace opened. Please open your project root folder.");
    }

    let allFiles: string[] = [];
    const ignoredDirs = ['node_modules', '.next', 'dist', 'build', 'out', '.git', '.vercel'];

    async function getFilesRecursively(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const resPath = path.resolve(dir, entry.name);
            if (entry.isDirectory()) {
                if (ignoredDirs.includes(entry.name)) continue;
                await getFilesRecursively(resPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
                    allFiles.push(resPath);
                }
            }
        }
    }

    for (const folder of workspaceFolders) {
        try {
            await getFilesRecursively(folder.uri.fsPath);
        } catch (error) {
            console.error(`Error scanning folder \${folder.name}:`, error);
        }
    }
    return allFiles;
}

/**
 * ব্যাকএন্ডের সব ফাইল থেকে এক্সপ্রেস রাউটগুলো এক্সট্রাক্ট করা
 */
export async function extractRoutes(files: string[]): Promise<RouteInfo[]> {
    const routes: RouteInfo[] = [];
    const regex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;

    for (const file of files) {
        // উইন্ডোজ ও ম্যাকের পাথের স্ল্যাশ ডাইনামিকালি হ্যান্ডেল করার ফিক্স
        const normalizedPath = file.replace(/\\/g, '/');
        
        // শুধু ব্যাকএন্ড ফোল্ডারের ফাইল স্ক্যান হবে
        if (!normalizedPath.includes('/backend/')) {
            continue;
        }

        try {
            const content = await fs.readFile(file, "utf-8");
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const method = match[1].toUpperCase();
                const routePath = match[2]; // পারফেক্ট রাউট স্ট্রিং

                routes.push({
                    route: routePath,
                    method: method,
                    file: file
                });
            }
        } catch {
            continue;
        }
    }
    return routes;
}

/**
 * ফ্রন্টএন্ড ফাইলে ম্যাচিং বা আংশিক মিল খুঁজে বের করা
 */
export async function findImpactedFrontendFiles(files: string[], backendRoutes: RouteInfo[]): Promise<ImpactedFile[]> {
    const impactedFiles: ImpactedFile[] = [];

    for (const file of files) {
        const normalizedPath = file.replace(/\\/g, '/');
        
        // ব্যাকএন্ড ফোল্ডারের ফাইল যেন ফ্রন্টএন্ড হিসেবে হাইলাইট না হয়
        if (normalizedPath.includes('/backend/')) {
            continue;
        }

        try {
            const content = await fs.readFile(file, "utf-8");
            const matchedRoutes: RouteInfo[] = [];

            for (const routeInfo of backendRoutes) {
                // ১. হুবহু মিল (Exact Match) চেক করা
                const cleanRoute = routeInfo.route.replace(/:[a-zA-Z0-9]+/g, ".*");
                const exactRegex = new RegExp(`['"\`].*?\${cleanRoute}.*?['"\`]`, 'i');

                // ২. স্মার্ট মিসম্যাচ লজিক: মেথড এবং কিওয়ার্ড চেক করা
                const methodRegex = new RegExp(`method\\s*:\\s*['"\`]\\s*\${routeInfo.method}\\s*['"\`]`, 'i');
                const hasMethod = methodRegex.test(content);

                let isSmartMatch = false;

                if (hasMethod) {
                    const routeParts = routeInfo.route.split('/').filter(part => part && !part.startsWith(':'));
                    for (const part of routeParts) {
                        // ২ অক্ষরের কিওয়ার্ডও (যেমন: 'me') এলাউ করা হলো যেন আপনার মিসম্যাচ রাউটটি ধরা পড়ে
                        if (part.length >= 2) {
                            if (content.toLowerCase().includes(part.toLowerCase())) {
                                isSmartMatch = true;
                                break;
                            }
                        }
                    }
                }

                if (exactRegex.test(content) || isSmartMatch) {
                    matchedRoutes.push(routeInfo);
                }
            }

            if (matchedRoutes.length > 0) {
                impactedFiles.push({
                    filePath: file,
                    affectedRoutes: matchedRoutes
                });
            }
        } catch {
            continue;
        }
    }

    return impactedFiles;
}