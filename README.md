# Ember Prefetch [![Build Status](https://travis-ci.org/nickiaconis/ember-prefetch.svg)](https://travis-ci.org/nickiaconis/ember-prefetch) [![npm version](https://badge.fury.io/js/ember-prefetch.svg)](http://badge.fury.io/js/ember-prefetch)

This addon provides an implementation of the `prefetch` hook from [Ember RFC #97](https://github.com/emberjs/rfcs/pull/97).

## Installation

* `npm install [--save|--save-dev] ember-prefetch`

## Usage

The `prefetch` hook is used largely the same as the `model` hook.
It takes the same parameters (`params` and `transition`) and is not called if an object has been passed to the transition.
However, the `prefetch` hook for all routes in a transition are invoked at the beginning of the transition.
This allows child routes to resolve faster because their requests are made in parallel with their parents'.

```javascript
App.PostRoute = Ember.Route.extend({
  prefetch(params) {
    return Ember.$.get(`/api/posts/${params.id}`);
  }
});

App.PostCommentsRoute = Ember.Route.extend({
  prefetch(params, transition) {
    return Ember.$.get(`/api/posts/${transition.params.post.id}/comments`);
  }
});
```

The default functionality of the `model` hook will pick up whatever is returned from the `prefetch` hook.
A route that defines a `prefetch` hook is not required to define a `model` hook.

The `prefetched` method provides access to routes' prefetched data. `prefetched` will always return a promise, but ES7 async function syntax makes working with it easy.

```javascript
App.PostCommentsRoute = Ember.Route.extend({
  prefetch(params, transition) {
    return Ember.$.get(`/api/posts/${this.paramsFor('post').id}/comments`);
  },

  async model() {
    return {
      OP: (await this.prefetched('post')).author,
      comments: await this.prefetched(),
    };
  }
});
```

## Contributing

* `git clone` this repository
* `npm install`
* `bower install`

## Running Tests

* `ember test`
* `ember test --server`
