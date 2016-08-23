/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";
import * as pathToRegexp from "path-to-regexp";
import * as qs from "qs";
import { RouteContext } from "./context.ts";
import { extend } from "./utils.ts";

// work-around typescript commonjs module export
const _pathToRegexp = (pathToRegexp as any).default;

export type Action = (context: RouteContext) => Promise<void> | void;

export class Route {
    route: string;
    component: string;
    action: Action;
    context: RouteContext;

    private re: pathToRegexp.PathRegExp;
    private keys: (string | number)[];

    constructor(node: Element, routePrefix = "", actions = {}) {
        this.route = routePrefix + node.getAttribute("route");
        this.component = ko.components.getComponentNameForNode(node);
        this.action = noop;
        
        let actionKey = node.getAttribute("action");
        if (actionKey) {
            if (actions.hasOwnProperty(actionKey)) {
                this.action = actions[actionKey];
            } else {
                ko.components.defaultLoader.getConfig(this.component, (config) => {
                    if (config.hasOwnProperty(actionKey)) {
                        this.action = config[actionKey];
                    }
                });
            }
        }

        this.re = _pathToRegexp(this.route);
        this.keys = this.re.keys.map(k => k.name);
    }

    dispatch(url: string): boolean {
        let [path, queryString] = url.split("?");
        let matches = this.re.exec(path);
        if (!matches) {
            return false;
        }
        
        let params = {};
        for (let i = 1; i < matches.length; ++i) {
            params[this.keys[i - 1]] = matches[i];
        }

        extend(params, qs.parse(queryString));

        this.context = {
            params: params,
            state: null,
            route: this.route,
            url: matches[0],
        };

        return true;
    }
}

function noop() {}