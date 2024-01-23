interface Action {
}

export default class State {
  private actions: Action[];
  constructor() {
    this.actions = [];
    this.#setEventListeners();
  }

  #setEventListeners() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      const key = (event.key || '').toLowerCase();

      if (key == "u") {
        this.#undo();
        event.preventDefault();
      }
      if (key == "r" && (event.ctrlKey == true || event.metaKey)) {
        this.#redo();
        event.preventDefault();
      }
    }, false);
  }

  #undo() {
    if (this.actions.length <= 0) {
      console.log('Already the last change');
    }
  }

  #redo() {

  }
}
