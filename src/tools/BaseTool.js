export default class BaseTool extends Visualive.ParameterOwner {
  constructor(undoRedoManager) {
    super();
    this.undoRedoManager = undoRedoManager;

    this.actionFinished = new Visualive.Signal()
  }

  activateTool(viewport) {
  }

  deactivateTool(renderer) {

  }

  /////////////////////////////////////
  // Mouse events

  screenPosToXfo(screenPos, viewport) {
    // 

    const camera = viewport.getCamera();

    const ray = viewport.calcRayFromScreenPos(screenPos);

    // Raycast any working planes.


    // else project based on focal dist.
    const xfo = camera.getGlobalXfo().clone();
    xfo.tr = ray.pointAtDist(camera.getFocalDistance());
    return xfo;
  }


  onMouseDown(event, mousePos, viewport) {}

  onMouseMove(event, mousePos, viewport) {}

  onMouseUp(event, mousePos, viewport) {}

  onWheel(event, viewport) {}

  /////////////////////////////////////
  // Keyboard events
  onKeyPressed(key, event, viewport) {}

  onKeyDown(key, event, viewport) {}

  onKeyUp(key, event, viewport) {}

  /////////////////////////////////////
  // Touch events
  onTouchStart(event, viewport) {}

  onTouchMove(event, viewport) {}

  onTouchEnd(event, viewport) {}

  onTouchCancel(event, viewport) {}

  /////////////////////////////////////
  // VRController events
  onVRControllerDown(event, viewport) {}

  onVRControllerMove(event, viewport) {}

  onVRControllerUp(event, viewport) {}

};
