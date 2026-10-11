export interface RouteInfo {
  route: string;
  method: string;
  file: string;
}

export interface ImpactedFile {
  filePath: string;
  affectedRoutes: RouteInfo[];
}