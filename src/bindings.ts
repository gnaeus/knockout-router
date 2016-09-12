/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";
import {
    RouterTag, getParentRouter,
    resolveUrl, eventWhich, getUrl
} from  "./utils.ts";
import { navigate } from "./router.ts";

// 'query:' and 'activePathCss:' bindings works only with 'path:' binding together
ko.bindingHandlers["path"] = {
    init(el, va, ab, vm, ctx) {
        applyBinding.call(this, el, ab, ctx);
    }
};

export const bindingsCurrentPath = ko.observable(location.pathname);

function applyBinding(
    el: Element,
    allBindings: ko.AllBindingsAccessor,
    ctx: ko.BindingContext<any>
) {
    let router = getParentRouter(ko.contextFor(el));
    let rootUrl = router && router.rootUrl || "";
    let bindingsToApply = {};

    let url = ko.pureComputed(() => resolveUrl(
        rootUrl, allBindings.get("path"), allBindings.get("query")
    ));

    if (el.tagName.toLocaleUpperCase() === "A") {
        bindingsToApply["attr"] = { href: url };
    } else {
        bindingsToApply["click"] = (data, e) => {
            let debounce = 1 !== eventWhich(e);
            let hasOtherTarget = el.hasAttribute("target");
            let hasExternalRel = el.getAttribute("rel") === "external";
            let modifierKey = e.metaKey || e.ctrlKey || e.shiftKey;

            if (debounce || hasOtherTarget || hasExternalRel || modifierKey) {
                return true;
            }

            let handled = navigate(url());
            if (handled) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            return !handled;
        };
    }

    let activePathCss = allBindings.get("activePathCss");
    if (activePathCss) {
        let path = ko.pureComputed(() => resolveUrl(
            rootUrl, allBindings.get("path")
        ));

        bindingsToApply["css"] = {
            [activePathCss]: ko.pureComputed(() => path() === bindingsCurrentPath())
        };
    }

    // allow adjacent routers to initialize
    ko.tasks.schedule(() => ko.applyBindingsToNode(el, bindingsToApply, ctx));
}