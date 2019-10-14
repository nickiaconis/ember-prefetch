import Route from '@ember/routing/route';

export default Route.extend({
  counter: 0,
  prefetch() {
    const parentModel = this.prefetched('refreshParent');
    return parentModel.then(model => {
      return {
        derivedParentValue: model.originalValue,
        currentCounter: this.counter++,
      };
    });
  },

  actions: {
    refreshChild() {
      this.refresh();
    },
  },
});
