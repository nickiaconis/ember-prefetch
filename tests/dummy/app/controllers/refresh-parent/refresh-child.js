import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    modifyValue() {
      this.send('updateParentValue');
      this.send('refreshChild');
    },
    refreshCurrent() {
      this.send('refreshChild');
    },
  },
});
