/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
export function find<T>(arr: T[], predicate: (el: T) => boolean): T {
    let i = 0, length = arr.length;
    while (i < length) {
        let el = arr[i++];
        if (predicate(el)) {
            return el;
        }
    }
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