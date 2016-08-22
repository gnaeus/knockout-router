/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";
import { find } from  "./utils.ts";

const ROOT_URL = typeof Symbol !== "undefined"
    ? Symbol("rootUrl") : "__knockout_router_root_url_";

// TODO: 'path' (from rootUrl) & 'query' (by "qs") bindings
// TODO: handle existing 'href' attr at 'path' init
// TODO: handle '~/' as rootUrl
(ko.bindingHandlers as any).path = {
    init(element: HTMLElement) {
        let $parents = ko.contextFor(element).$parents;
        let router = find($parents, ctx => ctx && ctx.rootUrl);
        if (router && router.rootUrl) {
            element[ROOT_URL] = router.rootUrl;
        }
    },
    update(element: HTMLElement, valueAccessor: () => any) {
       let rootUrl = element[ROOT_URL] || "";
       element.setAttribute("href", rootUrl + ko.unwrap(valueAccessor()));
    }
};