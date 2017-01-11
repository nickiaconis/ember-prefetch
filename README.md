# Ember Prefetch [![Build Status](https://travis-ci.org/nickiaconis/ember-prefetch.svg)](https://travis-ci.org/nickiaconis/ember-prefetch) [![npm version](https://badge.fury.io/js/ember-prefetch.svg)](http://badge.fury.io/js/ember-prefetch)

This addon provides an implementation of the `prefetch` hook from [Ember RFC #97](https://github.com/emberjs/rfcs/pull/97).

## Installation

* `yarn add ember-prefetch`
* alternate: `npm install [--save|--save-dev] ember-prefetch`

## Usage

### Route#prefetch

The `prefetch` hook is used largely the same as the `model` hook.
It takes the same parameters (`params` and `transition`) and is not called if an object has been passed to the transition.
However, the `prefetch` hook of all routes involved in a transition are invoked at the beginning of that transition.
This enables child routes to settle faster because their network requests are made in parallel with their parents'.

```javascript
App.PostRoute = Ember.Route.extend({
  prefetch(params) {
    return Ember.$.get(`/api/posts/${params.id}`);
  },
});

App.PostCommentsRoute = Ember.Route.extend({
  prefetch(params, transition) {
    return Ember.$.get(`/api/posts/${this.paramsFor('post').id}/comments`);
  },
});
```

The default functionality of the `model` hook will pick up whatever is returned from the `prefetch` hook.
A route that defines a `prefetch` hook is not required to define a `model` hook.

### Route#prefetched

The `prefetched` method provides access to routes' prefetched data.
`prefetched` always returns a promise, but ES7 async function syntax simplifies working with promises.

```javascript
App.PostCommentsRoute = Ember.Route.extend({
  async prefetch(params, transition) {
    return {
      // getting a parent route's data; the syntax is akin to `paramsFor`
      OP: (await this.prefetched('post')).author,
      comments: await Ember.$.get(`/api/posts/${this.paramsFor('post').id}/comments`),
    };
  },
});
```

## Contributing

Make sure you have Yarn installed. ([How do I install Yarn?](https://yarnpkg.com/en/docs/install))

* `git clone` this repository
* `yarn install`
* `node_modules/bower/bin/bower install`

## Running Tests

* `ember test`
* `ember test --server`
