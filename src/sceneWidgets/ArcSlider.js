import { BaseAxialRotationHandle } from './BaseAxialRotationHandle.js';

import ParameterValueChange from '../undoredo/ParameterValueChange.js';

/** Class representing a slider scene widget.
 * @extends BaseAxialRotationHandle
 */
class ArcSlider extends BaseAxialRotationHandle {
  /**
   * Create a slider scene widget.
   * @param {any} name - The name value.
   * @param {any} length - The length value.
   * @param {any} radius - The radius value.
   * @param {any} color - The color value.
   */
  constructor(
    name,
    arcRadius = 1,
    arcAngle = 1,
    handleRadius = 0.02,
    color = new ZeaEngine.Color(1, 1, 0)
  ) {
    super(name);
    this.arcRadiusParam = this.addParameter(
      new ZeaEngine.NumberParameter('Arc Radius', arcRadius)
    );
    this.arcAngleParam = this.addParameter(
      new ZeaEngine.NumberParameter('Arc Angle', arcAngle)
    );
    this.handleRadiusParam = this.addParameter(
      new ZeaEngine.NumberParameter('Handle Radius', handleRadius)
    );
    // this.barRadiusParam = this.addParameter(
    //   new ZeaEngine.NumberParameter('Bar Radius', radius * 0.25)
    // );
    this.colorParam = this.addParameter(
      new ZeaEngine.ColorParameter('Color', color)
    );
    this.hilghlightColorParam = this.addParameter(
      new ZeaEngine.ColorParameter(
        'Highlight Color',
        new ZeaEngine.Color(1, 1, 1)
      )
    );

    this.handleMat = new ZeaEngine.Material('handleMat', 'HandleShader');
    const arcGeom = new ZeaEngine.Circle(arcRadius, arcAngle, 64);
    const handleGeom = new ZeaEngine.Sphere(handleRadius, 64);

    this.handle = new ZeaEngine.GeomItem('handle', handleGeom, this.handleMat);
    this.arc = new ZeaEngine.GeomItem('arc', arcGeom, this.handleMat);
    this.handleXfo = new ZeaEngine.Xfo();
    this.handleGeomOffsetXfo = new ZeaEngine.Xfo();
    this.handleGeomOffsetXfo.tr.x = arcRadius;
    this.handle
      .getParameter('GeomOffsetXfo')
      .setValue(this.handleGeomOffsetXfo);

    // this.barRadiusParam.valueChanged.connect(() => {
    //   arcGeom.getParameter('radius').setValue(this.barRadiusParam.getValue());
    // });

    this.range = [0, arcAngle]
    this.arcAngleParam.valueChanged.connect(() => {
      const arcAngle = this.arcAngleParam.getValue();
      arcGeom.getParameter('Angle').setValue(arcAngle);
      this.range = [0, arcAngle];
    });
    this.arcRadiusParam.valueChanged.connect(() => {
      const arcRadius = this.arcRadiusParam.getValue();
      arcGeom.getParameter('Radius').setValue(arcRadius);
      this.handleGeomOffsetXfo.tr.x = arcRadius;
      this.handle
        .getParameter('GeomOffsetXfo')
        .setValue(this.handleGeomOffsetXfo);
    });
    this.handleRadiusParam.valueChanged.connect(() => {
      handleGeom
        .getParameter('radius')
        .setValue(this.handleRadiusParam.getValue());
    });
    this.colorParam.valueChanged.connect(() => {
      this.handleMat
        .getParameter('BaseColor')
        .setValue(this.colorParam.getValue());
    });

    this.addChild(this.handle);
    this.addChild(this.arc);

    // this.__updateSlider(0);
    this.setTargetParam(this.handle.getParameter('GlobalXfo'), false)

    
    this.dragStart = new ZeaEngine.Signal();
    this.dragEnd = new ZeaEngine.Signal();
  }

  // ///////////////////////////////////
  // Mouse events

  /**
   * The onMouseEnter method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onMouseEnter(event) {
    if (event.intersectionData && 
      event.intersectionData.geomItem == this.handle)
      this.highlight();
  }
  
  /**
   * The onMouseLeave method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onMouseLeave(event) {
    this.unhighlight();
  }
  
  /**
   * The onMouseDown method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onMouseDown(event) {
    // We do not want to handle events
    // that have propagated from children of
    // the slider.
    if (event.intersectionData && 
      event.intersectionData.geomItem == this.handle)
      super.onMouseDown(event)
  }


  /**
   * The highlight method.
   */
  highlight() {
    this.handleMat.getParameter('BaseColor').setValue(this.hilghlightColorParam.getValue());
  }

  /**
   * The unhighlight method.
   */
  unhighlight() {
    this.handleMat.getParameter('BaseColor').setValue(this.colorParam.getValue());
  }

  // /**
  //  * The setTargetParam method.
  //  * @param {any} param - The param param.
  //  */
  // setTargetParam(param) {
  //   this.param = param;
  //   const __updateSlider = () => {
  //     this.__updateSlider(param.getValue());
  //   };
  //   __updateSlider();
  //   param.valueChanged.connect(__updateSlider);
  // }

  // eslint-disable-next-line require-jsdoc
  // __updateSlider(value) {
  //   this.value = value
  //   const range =
  //     this.param && this.param.getRange() ? this.param.getRange() : [0, 1];
  //   const v = Math.remap(value, range[0], range[1], 0, 1);
  //   const length = this.arcAngleParam.getValue();
  //   this.handleXfo.ori.setFromAxisAndAngle(this.axis, ) = v * length;
  //   this.handle.setLocalXfo(this.handleXfo, ZeaEngine.ValueSetMode.GENERATED_VALUE);
  // }

  // ///////////////////////////////////
  // Interaction events

  /**
   * The getBaseXfo method.
   */
  getBaseXfo() {
    return this.handle.getParameter('GlobalXfo').getValue();
  }

  /**
   * The onDragStart method.
   * @param {any} event - The event param.
   */
  onDragStart(event) {

    this.baseXfo = this.getGlobalXfo().clone();
    this.baseXfo.sc.set(1, 1, 1);
    this.deltaXfo = new ZeaEngine.Xfo();
    // this.offsetXfo = this.baseXfo.inverse().multiply(this.param.getValue());
    
    this.vec0 = this.getGlobalXfo().ori.getXaxis();
    // this.grabCircleRadius = this.arcRadiusParam.getValue();
    this.vec0.normalizeInPlace();

    if (event.undoRedoManager) {
      this.change = new ParameterValueChange(this.param);
      event.undoRedoManager.addChange(this.change);
    }

    // Hilight the material.
    this.handleGeomOffsetXfo.sc.x = this.handleGeomOffsetXfo.sc.y = this.handleGeomOffsetXfo.sc.z = 1.2;
    this.handle
      .getParameter('GeomOffsetXfo')
      .setValue(this.handleGeomOffsetXfo);
    
    this.dragStart.emit();
  }

  /**
   * The onDrag method.
   * @param {any} event - The event param.
   */
  onDrag(event) {
    const vec1 = event.holdPos.subtract(this.baseXfo.tr);
    vec1.normalizeInPlace();

    let angle = this.vec0.angleTo(vec1);
    if (this.vec0.cross(vec1).dot(this.baseXfo.ori.getZaxis()) < 0)
      angle = -angle;

    if (this.range) {
      angle = Math.clamp(angle, this.range[0], this.range[1]);
    }

    if (event.shiftKey) {
      // modulat the angle to X degree increments.
      const increment = Math.degToRad(22.5);
      angle = Math.floor(angle / increment) * increment;
    }

    this.deltaXfo.ori.setFromAxisAndAngle(new ZeaEngine.Vec3(0, 0, 1), angle);

    const newXfo = this.baseXfo.multiply(this.deltaXfo);
    const value = newXfo;//.multiply(this.offsetXfo);

    if (this.change) {
      this.change.update({
        value,
      });
    } else {
      this.param.setValue(value);
    }
  }

  /**
   * The onDragEnd method.
   * @param {any} event - The event param.
   */
  onDragEnd(event) {
    this.change = null;
    this.handleGeomOffsetXfo.sc.x = this.handleGeomOffsetXfo.sc.y = this.handleGeomOffsetXfo.sc.z = 1.0;
    this.handle
      .getParameter('GeomOffsetXfo')
      .setValue(this.handleGeomOffsetXfo);

    this.dragEnd.emit();
  }

  /**
   * The toJSON method.
   * @param {any} context - The context param.
   * @param {any} flags - The flags param.
   * @return {any} The return value.
   */
  toJSON(context, flags = 0) {
    const json = super.toJSON(
      context,
      flags | ZeaEngine.SAVE_FLAG_SKIP_CHILDREN
    );
    if (this.param) json.targetParam = this.param.getPath();
    return json;
  }

  /**
   * The fromJSON method.
   * @param {any} json - The json param.
   * @param {any} context - The context param.
   * @param {any} flags - The flags param.
   */
  fromJSON(json, context, flags) {
    super.fromJSON(json, context, flags);

    if (json.targetParam) {
      context.resolvePath(json.targetParam).then(param => {
        this.setTargetParam(param);
      });
    }
  }
}

ZeaEngine.sgFactory.registerClass('ArcSlider', ArcSlider);

export { ArcSlider };
