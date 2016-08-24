/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";

export const arrayFirst = ko.utils.arrayFirst;
export const objectForEach = ko.utils.objectForEach;
export const extend = ko.utils.extend;

export function inherit<T, U>(target: T, source: U): T & U {
    if (source) {
        for (let prop in source) {
            if (source.hasOwnProperty(prop) && !target.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }
    }
    return target as any;
}

export class RouterTag { }

export function getParentRouter(bindingContext: ko.BindingContext<any>): any {
    return arrayFirst(bindingContext.$parents, vm => vm instanceof RouterTag);
}

export function getPath({ pathname, search, hash }): string {
    return pathname + search + (hash || "");
}

export function eventWhich(event): number {
    event = event || window.event;
    return null === event.which ? event.button : event.which;
}

export function sameOrigin(href): boolean {
    let origin = location.protocol + "//" + location.hostname;
    if (location.port) {
        origin += ":" + location.port;
    }
    return href && (0 === href.indexOf(origin));
}

const bindingProvider = new ko.bindingProvider();
const bindingOptions = { bindingParams: true };

export type ParamsBindings = Object & { [name: string]: any };

export function getParamsBindings(
    element: Element, context: ko.BindingContext<any>
): ParamsBindings {
    let paramsString = element.getAttribute("params");
    if (!paramsString) {
        return {};
    }
    return bindingProvider.parseBindingsString(
        paramsString, context, element, bindingOptions
    );
}