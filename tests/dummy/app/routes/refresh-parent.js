import Route from '@ember/routing/route';

export default Route.extend({
  serveOriginalValue: true,
  prefetch() {
    return {
      originalValue: this.serveOriginalValue ? 'original' : 'modified',
    };
  },

  actions: {
    updateParentValue() {
      this.serveOriginalValue = false;
      this.refresh();
    },
  },
});
