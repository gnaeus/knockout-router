export type Action = (context: RouteContext) => any;

export interface RouteContext {
    params: {
        [key: string]: any
    },
    state: any,
    route: any,
    url: any,
}

export interface RouterOptions {
    rootUrl?: string,
    routePrefix?: string,
    actions?: Object & {
        [key: string]: Action,
    }
}

export function navigate(url: string, replace?: boolean): boolean;