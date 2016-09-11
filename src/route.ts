/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";
import * as pathToRegexp from "path-to-regexp";
import * as qs from "qs";
import { RouteContext } from "./context.ts";
import { ParamsBindings, getParamsBindings, extend } from "./utils.ts";

// work-around typescript commonjs module export
const _pathToRegexp = (pathToRegexp as any).default;

export type Action = (context: RouteContext) => Promise<void> | void;

export class Route {
    component: string;
    route: string;
    action: Action;
    context: RouteContext;
    restParams: ParamsBindings;

    private re: pathToRegexp.PathRegExp;
    private keys: (string | number)[];

    constructor(
        node: Element,
        bindingContext: ko.BindingContext<any>,
        routePrefix: string,
        actions: Object
    ) {
        this.component = ko.components.getComponentNameForNode(node);
        this.restParams = getParamsBindings(node, bindingContext);

        let { route, action } = this.restParams;
        delete this.restParams['route'];
        delete this.restParams['action'];

        route = route 
            || node.getAttribute("data-route")
            || node.getAttribute("route") ;
        action = action
            || node.getAttribute("data-action")
            || node.getAttribute("action");
        
        this.route = routePrefix + route;
        this.action = noop;

        if (typeof action === "function") {
            this.action = action;
        } else if (typeof action === "string") {
            if (actions.hasOwnProperty(action)) {
                this.action = actions[action];
            }
        } else {
            ko.components.defaultLoader.getConfig(this.component, config => {
                if (config.hasOwnProperty("action")) {
                    this.action = config["action"];
                }
            });
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