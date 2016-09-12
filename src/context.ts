/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
import * as ko from "knockout";
import { ParamsBindings, inherit, objectForEach } from "./utils.ts";

export interface RouteContext {
    params: Object & {
        [key: string]: any
    };
    state: any;
    route: any;
    url: any;
}

export class ComponentParams implements RouteContext {
    params: Object & {
        [key: string]: ko.Observable<any>
    } = {};
    state = ko.observable<any>();
    route = ko.observable<string>();
    url = ko.observable<string>();

    constructor(context: RouteContext, restParams: ParamsBindings) {
        this.update(context);
        inherit(this, restParams);
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
        });
        this.state(state);
        this.route(route);
        this.url(url);
    }
}