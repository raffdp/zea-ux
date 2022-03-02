import {
  MathFunctions,
  Parameter,
  Vec3,
  Xfo,
  XfoParameter,
  ZeaPointerEvent,
  ZeaMouseEvent,
  ZeaTouchEvent,
  NumberParameter,
} from '@zeainc/zea-engine'
import Handle from './Handle'
import ParameterValueChange from '../UndoRedo/Changes/ParameterValueChange'
import UndoRedoManager from '../UndoRedo/UndoRedoManager'
import SelectionXfoChange from '../UndoRedo/Changes/SelectionXfoChange'
import SelectionGroup from '../SelectionGroup'
import { Change } from '..'

/**
 * Class representing an axial rotation scene widget.
 *
 * @extends Handle
 */
class BaseAxialRotationHandle extends Handle {
  param: NumberParameter | XfoParameter
  baseXfo: Xfo
  grabCircleRadius: number
  vec0: Vec3
  change: Change
  range: Array<number>

  selectionGroup: SelectionGroup
  /**
   * Create an axial rotation scene widget.
   *
   * @param name - The name value.
   */
  constructor(name: string) {
    super(name)
  }

  /**
   * Sets selectionGroup so this handle can modify the items.
   *
   * @param selectionGroup - The SelectionGroup.
   */
  setSelectionGroup(selectionGroup: SelectionGroup): void {
    this.selectionGroup = selectionGroup
  }

  /**
   * Sets global xfo target parameter
   *
   * @param param - The param param.
   * @param track - The track param.
   */
  setTargetParam(param: XfoParameter, track = true): void {
    this.param = param
    if (track) {
      const __updateGizmo = () => {
        this.globalXfoParam.value = param.getValue()
      }
      __updateGizmo()
      param.on('valueChanged', __updateGizmo)
    }
  }

  /**
   * Returns target's global xfo parameter.
   *
   * @return {Parameter} - returns handle's target global Xfo.
   */
  getTargetParam(): NumberParameter | XfoParameter {
    return this.param ? this.param : this.globalXfoParam
  }

  /**
   * Handles the initially drag of the handle.
   *
   * @param event - The event param.
   */
  onDragStart(event: ZeaPointerEvent): void {
    this.baseXfo = this.globalXfoParam.value.clone()

    this.vec0 = this.grabPos.subtract(this.baseXfo.tr)
    this.grabCircleRadius = this.vec0.length()
    this.vec0.normalizeInPlace()

    // this.offsetXfo = this.localXfoParam.value.inverse()
    if (this.selectionGroup) {
      const items = this.selectionGroup.getItems()
      this.change = new SelectionXfoChange(Array.from(items), this.baseXfo)
      UndoRedoManager.getInstance().addChange(this.change)
    } else {
      const param = this.getTargetParam()
      this.change = new ParameterValueChange(param)
      UndoRedoManager.getInstance().addChange(this.change)
    }
  }

  /**
   * Handles drag action of the handle.
   *
   * @param event - The event param.
   */
  onDrag(event: ZeaPointerEvent): void {
    const vec1 = this.holdPos.subtract(this.baseXfo.tr)
    // const dragCircleRadius = vec1.length()
    vec1.normalizeInPlace()

    // modulate the angle by the radius the mouse moves
    // away from the center of the handle.
    // This makes it possible to rotate the object more than
    // 180 degrees in a single movement.
    // Note: this modulator made rotations quite unpredictable
    // especially when the angle between the ray and the plane is acute.
    // disabling for now.
    const modulator = 1.0 //dragCircleRadius / this.grabCircleRadius
    let angle = this.vec0.angleTo(vec1) * modulator
    if (this.vec0.cross(vec1).dot(this.baseXfo.ori.getZaxis()) < 0) angle = -angle

    if (this.range) {
      angle = MathFunctions.clamp(angle, this.range[0], this.range[1])
    }

    if ((event instanceof ZeaMouseEvent || event instanceof ZeaTouchEvent) && event.shiftKey) {
      // modulat the angle to X degree increments.
      const degree: number = 22.5
      const rad: number = degree * (Math.PI / 180)
      const increment = rad //Math.degToRad(22.5)
      angle = Math.floor(angle / increment) * increment
    }

    const deltaXfo = new Xfo()
    deltaXfo.ori.setFromAxisAndAngle(this.baseXfo.ori.getZaxis(), angle)

    if (this.selectionGroup) {
      const selectionXfoChange = <SelectionXfoChange>this.change
      selectionXfoChange.setDeltaXfo(deltaXfo)
    } else {
      const value = this.baseXfo.clone()
      value.ori = deltaXfo.ori.multiply(value.ori)

      this.change.update({
        value,
      })
    }
  }

  /**
   * Handles the end of dragging the handle.
   *
   * @param event - The event param.
   */
  onDragEnd(event: ZeaPointerEvent): void {
    if (this.selectionGroup) {
      const selectionXfoChange = <SelectionXfoChange>this.change
      selectionXfoChange.setDone()
    }
    this.change = null
  }
}

export default BaseAxialRotationHandle
export { BaseAxialRotationHandle }
