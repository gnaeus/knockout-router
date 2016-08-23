/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";

interface ArrayLike<T> {
    length: number,
    [index: number]: T,
}

type ArraySlice = <T>(arrayLike: ArrayLike<T>, start?: number, end?: number) => T[];

export const arraySlice: ArraySlice = Function.prototype.call.bind(Array.prototype.slice);
export const arrayFirst = ko.utils.arrayFirst;
export const objectForEach = ko.utils.objectForEach;
export const extend = ko.utils.extend;

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

// custom binding semantics
const bindingProvider = new ko.bindingProvider();
const bindingOptions = { bindingParams: true };

export function getAttributeBindings(
    element: Element, context: ko.BindingContext<any>
): Object {
    let attributes = {}, bindingStrings = [];
    arraySlice(element.attributes).forEach(({ name, value }) => {
        let end = value && value.length - 1;
        if (value && value[0] === "{" && value[end] === "}") {
            bindingStrings.push(name + ":" + value.substr(1, end));
        } else {
            attributes[name] = value;
        }
    });

    let bindings = bindingProvider.parseBindingsString(
        bindingStrings.join(","), context, element, bindingOptions
    );
    return extend(bindings, attributes);
}