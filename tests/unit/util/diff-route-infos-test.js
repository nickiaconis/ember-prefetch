import {
  paramsDiffer,
  pathsDiffer,
  diffQPs,
  shouldRefreshModel,
} from 'ember-prefetch/-private/diff-route-info';
import { module, test } from 'qunit';
import { assign } from '@ember/polyfills';
import { gte } from 'ember-compatibility-helpers';

if (gte('3.6.0')) {
  module('paramsDiffer', () => {
    test('returns false if the params match', assert => {
      let info = {
        paramNames: ['post_id', 'comment_id'],
        params: { post_id: '1', comment_id: '1' },
      };
      let [match] = paramsDiffer([info], [info]);

      assert.notOk(match);
    });

    test('returns true if the params mismatch', assert => {
      let info = {
        paramNames: ['post_id', 'comment_id'],
        params: { post_id: '1', comment_id: '1' },
      };
      let info2 = assign({}, info, { params: { post_id: '2' } });
      let [match] = paramsDiffer([info], [info2]);
      assert.ok(match);
    });

    test('returns true if the paramNames mismatch', assert => {
      let info = {
        paramNames: ['post_id', 'comment_id'],
        params: { post_id: '1', comment_id: '1' },
      };
      let info2 = assign({}, info, { paramNames: ['picture_id', 'comment_id'] });
      let [match] = paramsDiffer([info], [info2]);
      assert.ok(match);
    });

    test('returns true if paramNames are empty', assert => {
      let info = {
        paramNames: ['post_id', 'comment_id'],
        params: { post_id: '1', comment_id: '1' },
      };
      let info2 = assign({}, info, { paramNames: [] });
      let [match] = paramsDiffer([info], [info2]);
      assert.ok(match);
    });

    test('returns true if params are empty', assert => {
      let info = {
        paramNames: ['post_id', 'comment_id'],
        params: { post_id: '1', comment_id: '1' },
      };
      let info2 = assign({}, info, { params: {} });
      let [match] = paramsDiffer([info], [info2]);
      assert.ok(match);
    });

    test('smoke test (different)', assert => {
      let infos1 = [];
      let infos2 = [];

      for (let i = 0; i < 10; i++) {
        infos1.push({
          paramNames: [`${i}`],
          params: [{ [`${i}`]: 'foo' }],
        });

        infos2.push({
          paramNames: [`${i}*`],
          params: [{ [`${i}*`]: 'bar' }],
        });
      }
      let [match] = paramsDiffer(infos1, infos2);
      assert.ok(match);
    });

    test('smoke test (same)', assert => {
      let infos1 = [];
      let infos2 = [];

      for (let i = 0; i < 10; i++) {
        let info = {
          paramNames: [`${i}`],
          params: [{ [`${i}`]: 'foo' }],
        };
        infos1.push(info);
        infos2.push(info);
      }
      let [match] = paramsDiffer(infos1, infos2);
      assert.notOk(match);
    });
  });

  module('pathsDiffer', () => {
    test('returns false if the paths are the same', assert => {
      let info = {
        name: 'foo.bar',
      };
      let [match] = pathsDiffer([info], [info]);
      assert.notOk(match);
    });

    test('returns true if the paths changed', assert => {
      let info = {
        name: 'foo.bar',
      };
      let info2 = assign({}, info, { name: 'baz.bar' });
      let [match] = pathsDiffer([info], [info2]);
      assert.ok(match);
    });

    test('returns true if the paths changed', assert => {
      let info = {
        name: 'foo.bar',
      };
      let info2 = assign({}, info, { name: 'baz.bar' });
      let [match] = pathsDiffer([info], [info2]);
      assert.ok(match);
    });

    test('returns true if the paths mismatch', assert => {
      let infos1 = [];
      let infos2 = [];

      for (let i = 0; i < 10; i++) {
        infos1.push({
          name: `${i}`,
        });

        infos2.push({
          name: i % 2 ? `${i}` : `index`,
        });
      }
      let [match] = pathsDiffer(infos1, infos2);
      assert.ok(match);
    });
  });

  module('diffQPs', () => {
    test('returns empty diff if query params have not changed', assert => {
      let info = {
        queryParams: { a: 'b', c: 'd' },
      };
      assert.equal(diffQPs(info, info).length, 0);
    });

    test('returns true if the query params have been removed', assert => {
      let info = {
        queryParams: { a: 'b', c: 'd' },
      };
      let info2 = {
        queryParams: { a: 'b' },
      };
      assert.deepEqual(diffQPs(info, info2), ['c']);
    });

    test('returns true if the query params have changed', assert => {
      let info = {
        queryParams: { a: 'b', c: 'd' },
      };
      let info2 = {
        queryParams: { a: 'b', c: 'true' },
      };
      assert.deepEqual(diffQPs(info, info2), ['c']);
    });

    test('returns true query params have been added', assert => {
      let info = {
        queryParams: { a: 'b', c: 'd' },
      };
      let info2 = {
        queryParams: { a: 'b', c: 'd', e: 'f' },
      };
      assert.deepEqual(diffQPs(info, info2), ['e']);
    });

    test('returns true query params have been completely removed', assert => {
      let info = {
        queryParams: { a: 'b', c: 'd' },
      };
      let info2 = {
        queryParams: {},
      };
      assert.deepEqual(diffQPs(info, info2), ['a', 'c']);
    });
  });

  module('shouldRefreshModel', () => {
    test('returns true if the `refreshModel` is set to true for a given QP', assert => {
      let routeQp = {
        foo: { refreshModel: true },
      };
      let from = {
        queryParams: {
          foo: 'bar',
        },
      };
      let to = {
        queryParams: {},
      };
      assert.ok(shouldRefreshModel(routeQp, diffQPs(from, to)));
    });

    test('returns false if refreshModel isnt set', assert => {
      let routeQp = {};
      let from = {
        queryParams: {
          foo: 'bar',
        },
      };
      let to = {
        queryParams: {},
      };
      assert.notOk(shouldRefreshModel(routeQp, diffQPs(from, to)));
    });

    test('returns false if refreshModel isnt set for a given qp', assert => {
      let routeQp = {
        bar: { refreshModel: true },
      };
      let from = {
        queryParams: {
          foo: 'bar',
        },
      };
      let to = {
        queryParams: {},
      };
      assert.notOk(shouldRefreshModel(routeQp, diffQPs(from, to)));
    });

    test('returns true if refreshModel is set for any qp', assert => {
      let routeQp = {
        bar: { refreshModel: true },
      };
      let from = {
        queryParams: {
          foo: 'bar',
          biz: 'baz',
          bar: 'woot',
        },
      };
      let to = {
        queryParams: {},
      };
      assert.ok(shouldRefreshModel(routeQp, diffQPs(from, to)));
    });

    test('returns false if refreshModel is not set up for diff QPs', assert => {
      let routeQp = {
        bar: { refreshModel: true },
      };
      let from = {
        queryParams: {
          bar: 'woot',
        },
      };
      let to = {
        queryParams: {
          bar: 'woot',
        },
      };
      assert.notOk(shouldRefreshModel(routeQp, diffQPs(from, to)));
    });
  });
}
