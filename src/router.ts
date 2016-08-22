/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";
import { find, getPath, eventWhich, sameOrigin } from "./utils.ts";
import { RouteContext, ComponentContext } from "./context.ts";
import { Route, Action } from "./route.ts";
import "./bindings.ts";

const CLICK_EVENT = typeof document !== "undefined" && document.ontouchstart
    ? "touchstart" : "click";

const ROUTERS: Router[] = [];

export interface RouterOptions {
    rootUrl?: string,
    routePrefix?: string,
    actions?: Object & {
        [key: string]: Action,
    }
}

class Router {
    actions: Object;
    rootUrl: string;
    routePrefix: string;
    route: Route = null;
    
    private routes: Route[] = [];
    private binding = ko.observable<{
        component: string,
        params: ComponentContext,
    }>();
    
    constructor(element: Element, routeNodes: Element[], { 
        rootUrl, routePrefix, actions
    }: RouterOptions) {
        ROUTERS.push(this);
        if (ROUTERS.length === 1) {
            addEventListener(CLICK_EVENT, onLinkClick, false);
            addEventListener("popstate", onPopState, false);
        }
        rootUrl = rootUrl || element.getAttribute("rootUrl");
        routePrefix = routePrefix || element.getAttribute("routePrefix");

        let parent = getParentRouter(element);

        // inherited from parent
        this.actions = actions || parent && parent.actions || {};
        this.rootUrl = rootUrl || parent && parent.rootUrl || "";

        // concatenated with parent
        this.routePrefix = (parent && parent.routePrefix || "") + (routePrefix || "");

        this.routes = routeNodes.map(node => new Route(
            node, this.routePrefix, this.actions
        ));

        this.dispatchAndNavigate(getPath(location));
    }

    dispose() {
        ROUTERS.splice(ROUTERS.indexOf(this), 1);
        if (ROUTERS.length === 0) {
            removeEventListener(CLICK_EVENT, onLinkClick, false);
            removeEventListener("popstate", onPopState, false);
        }
    }

    dispatch(url: string) {
        this.route = find(this.routes, route => route.dispatch(url));
        if (!this.route) {
            return;
        }

        let binding = this.binding();
        let { component, context, action } = this.route;

        if (binding && binding.component === component) {
            context.state = binding.params.state();
        }

        return action(context) as Promise<void>;
    }

    navigate() {
        if (!this.route) {
            this.binding(null);
            return;
        }
        
        let { component, context } = this.route;
        let binding = this.binding();

        if (binding && binding.component === component) {
            binding.params.update(context);
        } else {
            this.binding({
                component: component,
                params: new ComponentContext(context),
            });
        }

        this.route = null;
    }

    dispatchAndNavigate(url: string) {
        let promise = this.dispatch(getPath(location));
        if (!promise) {
            this.navigate();
        } else {
            promise.then(() => { this.navigate() });
        }
    }
}

function getParentRouter(element: Element): Router {
    let $parents = ko.contextFor(element).$parents;
    return find($parents, vm => vm instanceof Router);
}

export function navigate(url: string, replace = false): boolean {
    let promises = ROUTERS
        .map(router => router.dispatch(url))
        .filter(promise => !!promise);

    let status = !!find(ROUTERS, router => !!router.route);

    if (promises.length == 0) {
        ROUTERS.forEach(router => { router.navigate(); });
    } else {
        Promise.all(promises).then(() => {
            ROUTERS.forEach(router => { router.navigate(); });
        });
    }
    // TODO: store and load hsitory state
    if (status && typeof history !== "undefined") {
        if (replace) {
            history.replaceState(null, null, url);
        } else {
            history.pushState(null, null, url);
        }
    }
    return status;
}

function onPopState(event: PopStateEvent) {
    if (event.defaultPrevented) {
        return;
    }
    if (navigate(getPath(location), true)) {
        event.preventDefault();
    }
}

// TODO: maybe prevent clicks when actions are executed ?
function onLinkClick(event: MouseEvent) {
    let target = event.target as HTMLAnchorElement;
    while (target && "A" !== target.nodeName) {
        target = target.parentNode as HTMLAnchorElement;
    }
    if (!target || "A" !== target.nodeName) {
        return; 
    }

    const isDoubleClick = 1 !== eventWhich(event);
    const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey;
    const isDownload = target.hasAttribute("download");
    const hasOtherTarget = target.hasAttribute("target");
    const hasExternalRel = target.getAttribute("rel") === "external";
    const isMailto = ~(target.getAttribute("href") || "").indexOf("mailto:");
    const isCrossOrigin = !sameOrigin(target.href);
    const isEmptyHash = target.getAttribute("href") === "#";

    if (isCrossOrigin || isDoubleClick || isDownload || isEmptyHash ||
        isMailto || hasExternalRel || hasModifier || hasOtherTarget
    ) {
        return;
    }

    if (navigate(getPath(target))) {
         event.preventDefault();
    }
}

ko.components.register("knockout-router", {
    synchronous: true,
    viewModel: {
        createViewModel: (params, { element, templateNodes }) => {
            return new Router(
                element as Element,
                templateNodes.filter(n => n.nodeType === 1) as Element[],
                params as any
            );
        },
    },
    template: `
        <!-- ko if: binding() -->
            <!-- ko component: {
                name: binding().component,
                params: binding().params
            } --><!-- /ko -->
        <!-- /ko -->
    `.replace(/\s+/g, " "),
});