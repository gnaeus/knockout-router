# Knockout Router
Simple router designed for usage with Knockout JS components with syntax inspired by ReactRouter

[![Build Status](https://travis-ci.org/gnaeus/knockout-router.svg?branch=master)](https://travis-ci.org/gnaeus/knockout-router)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/gnaeus/knockout-router/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/knockout-router.svg?style=flat)](https://www.npmjs.com/package/knockout-router)

### Example
```html
<knockout-router rootUrl="/virtualApp" params="actions: actions">
  <home-view route="/:userId" action="loadUser"></home-view>
  <feeds-view route="/:userId/feeds" action="loadFeeds"></feeds-view>
</knockout-router>

<template id="home-view">
  <h1>Home</h1>
  <a data-bind="path: '~/' + params.userId() + '/feeds'">Feeds</a>
</template>

<template id="feeds-view">
  <h1>Feeds</h1>
  <a data-bind="path: '~/' + params.userId() + '/feeds'">Posts</a>
  <a data-bind="path: '~/' + params.userId() + '/feeds/images'">Images</a>
  
  <knockout-router routePrefix="/:userId/feeds">
    <posts-view route="/"></posts-view>
    <images-view route="/images"></images-view>
  </knockout-router>
</template>

<template id="posts-view">
  <h2>Posts</h2>
</template>

<template id="images-view">
  <h2>Images</h2>
</template>
```
```js
import ko from "knockout";
import "knockout-router";

Array.from(document.querySelectorAll("template"))
  .map(node => node.getAttribute("id"))
  .forEach(id => {
    ko.components.register(id, template: { element: id });
  });

ko.applyBindings({
  actions: {
    async loadUser({ params }) {
      let resp = await fetch("/api/users/" + params.userId);
      // ...
    },
    async loadFeeds({ params }) {
      let resp = await fetch("/api/feets/" + params.userId);
      // ...
    }
  }
});
```

---
## Documentation
* [Configuring routes](#knockout-configuring-routes)
  * [Router options](#knockout-router-options)
  * [Route options](#knockout-route-options)
* [Actions and route context](#knockout-router-actions-and-context)
  * [Actions](#knockout-route-actions)
  * [Route context](#knockout-route-context)
  * [Route component lifecycle](#knockout-route-component-lifecycle)
* [Custom bindings](#knockout-router-bindings)
  * [path](#knockout-path-binding)
  * [query](#knockout-query-binding)
  * [activePathCss](#knockout-activePathCss-binding)

### <a name="knockout-configuring-routes"></a> Configuring routes
TBD
<br>

#### <a name="knockout-router-options"></a> Router options

<br>

#### <a name="knockout-route-options"></a> Route options

<br>

### <a name="knockout-router-actions-and-context"></a> Actions and route context
TBD
<br>

#### <a name="knockout-route-actions"></a> Actions

<br>

#### <a name="knockout-route-context"></a> Route context

<br>

#### <a name="knockout-route-component-lifecycle"></a> Route component lifecycle

<br>

### <a name="knockout-router-bindings"></a> Custom bindings
TBD
<br>

#### <a name="knockout-path-binding"></a> path

<br>

#### <a name="knockout-query-binding"></a> query

<br>

#### <a name="knockout-activePathCss-binding"></a> activePathCss
