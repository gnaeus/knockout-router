/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";
import * as qs from "qs";
import { find, eventWhich, getPath } from  "./utils.ts";
import { navigate } from "./router.ts";

ko.bindingHandlers['path'] =
ko.bindingHandlers['query'] =
ko.bindingHandlers['activePathCss'] = { 
    init(el, va, ab, vm, ctx) { 
        applyBinding.call(this, el, ab, ctx);
    }
};

const bindingsCurrentPath = ko.observable(location.pathname);

export function setBindingsCurrentPath(url: string) {
    url = url.split("#")[0].split("?")[0];
    bindingsCurrentPath(url);
}

function resolveUrl(rootUrl = "", path = "", query = null) {
    return (path.startsWith("~/") ? rootUrl + path.substr(1) : path)
         + (query ? "?" + qs.stringify(ko.toJS(query)) : "");
}

function applyBinding(
    el: Element,
    allBindings: ko.AllBindingsAccessor,
    ctx: ko.BindingContext<any>
) {
    let $parents = ko.contextFor(el).$parents;
    let router = find($parents, ctx => ctx && ctx.rootUrl);
    let rootUrl = router && router.rootUrl;

    let url = ko.pureComputed(() => resolveUrl(
        rootUrl, allBindings.get("path"), allBindings.get("query")
    ));

    let bindingsToApply = {};

    if (el.tagName.toLocaleUpperCase() === "A") {
        bindingsToApply['attr'] = { href: url }
    } else {
        bindingsToApply['click'] = (data, e) => {
            let debounce = 1 !== eventWhich(e);
            let hasOtherTarget = el.hasAttribute("target");
            let hasExternalRel = el.getAttribute("rel") === "external";
            let modifierKey = e.metaKey || e.ctrlKey || e.shiftKey;

            if (debounce || hasOtherTarget || hasExternalRel || modifierKey) {
                return true;
            }

            let handled = navigate(url());
            if (handled) {
                e.preventDefault()
                e.stopImmediatePropagation()
            }
            return !handled;
        };
    }

    let activePathCss = allBindings.get("activePathCss");
    if (activePathCss) {
        bindingsToApply['css'] = {
            [activePathCss]: ko.pureComputed(() => url() === bindingsCurrentPath())
        };
    }

    // allow adjacent routers to initialize
    ko.tasks.schedule(() => ko.applyBindingsToNode(el, bindingsToApply, ctx));
}