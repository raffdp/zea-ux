class UndoRedoManager {
  constructor() {
    this.__undoStack = [];
    this.__redoStack = [];

    this.changeAdded = new Visualive.Signal();
    this.changeUpdated = new Visualive.Signal();
    this.changeUndone = new Visualive.Signal();
    this.changeRedone = new Visualive.Signal();
  }

  addChange(change) {
    this.__undoStack.push(change);
    this.__redoStack = [];

    this.changeAdded.emit(change)
  }

  updateChange(updateData) {
    if(this.__undoStack.length > 0) {
      const change = this.__undoStack[this.__undoStack.length-1];
      change.update(updateData);
      this.changeUpdated.emit(updateData)
    }
  }

  undo() {
    if (this.__undoStack.length > 0) {
      const change = this.__undoStack.pop();
      change.undo();
      this.__redoStack.push(change);
      this.changeUndone.emit();
    }
  }

  redo() {
    if (this.__redoStack.length > 0) {
      const change = this.__redoStack.pop();
      change.redo();
      this.__undoStack.push(change);
      this.changeRedone.emit();
    }
  }
}

export default UndoRedoManager;