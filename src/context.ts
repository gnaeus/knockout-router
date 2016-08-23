/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";
import { objectForEach } from "./utils.ts";

export interface RouteContext {
    params: Object & {
        [key: string]: any
    },
    state: any,
    route: any,
    url: any,
}

export class ComponentContext implements RouteContext {
    params: Object & {
        [key: string]: ko.Observable<any>
    } = {};
    state = ko.observable<any>();
    route = ko.observable<string>();
    url = ko.observable<string>();

    constructor(context: RouteContext) {
        this.update(context);
    }

    update(context: RouteContext) {
        let { params, state, route, url } = context;
        objectForEach(params, (key, value) => {
            let observable = this.params[key];
            if (observable) {
                observable(value);
            } else {
                this.params[key] = ko.observable(value);
            }
        });
        objectForEach(this.params, (key, observable) => {
            if (!params.hasOwnProperty(key)) {
                observable(null);
            }
        })
        this.state(state);
        this.route(route);
        this.url(url);
    }
}