import UndoRedoManager from '../../undoredo/UndoRedoManager.js';
import {
  CreateGeomChange,
  CreateGeomTool
} from './CreateGeomTool.js';

class CreateSphereChange extends CreateGeomChange {
  constructor(parentItem, xfo) {
    super("Create Sphere", parentItem);

    this.sphere = new Visualive.Sphere(0, 64, 32);
    const material = new Visualive.Material('Sphere', 'SimpleSurfaceShader');
    this.geomItem = new Visualive.GeomItem('Sphere');
    this.geomItem.setGeometry(this.sphere);
    this.geomItem.setMaterial(material);

    if(parentItem && xfo) {
      this.setParentAndXfo(parentItem, xfo);
    }
  }

  update(updateData) {
    this.sphere.radius = updateData.radius;
    this.updated.emit(updateData);
  }

  toJSON() {
    const j = super.toJSON();
    j.radius = this.geomItem.getGeometry().radius;
    return j;
  }

  changeFromJSON(j) {
    if (j.radius)
      this.geomItem.getGeometry().radius =j.radius;
  }
}
UndoRedoManager.registerChange('CreateSphereChange', CreateSphereChange)

export default class CreateSphereTool extends CreateGeomTool {
  constructor(appData) {
    super(appData);
  }

  createStart(xfo, parentItem) {
    this.change = new CreateSphereChange(parentItem, xfo);
    this.appData.undoRedoManager.addChange(this.change);

    this.xfo = xfo;
    this.stage = 1;
    this.radius = 0.0;
  }

  createMove(pt) {
    this.radius = pt.distanceTo(this.xfo.tr);
    this.change.update({ radius: this.radius });
  }

  createRelease(pt) {
    if (this.radius == 0) {
      this.appData.undoRedoManager.undo(false);
    }
    this.stage = 0;
    this.actionFinished.emit();
  }
}

