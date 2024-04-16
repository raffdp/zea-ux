import {
  Quat,
  Color,
  Xfo,
  BaseTool,
  TreeItem,
  ZeaMouseEvent,
  XRControllerEvent,
  XRPoseEvent,
  GeomItem,
  XRController,
  ZeaPointerEvent,
  Lines,
  Vec3Attribute,
  Vec3,
  LinesMaterial,
} from '@zeainc/zea-engine'

import UndoRedoManager from '../../UndoRedo/UndoRedoManager'
import Change from '../../UndoRedo/Change'
import { AppData } from '../../../types/types'
import { line, lineMaterial } from '../../helpers/line'

/**
 * Class representing a hold objects change.
 *
 * @extends Change
 */
class HoldObjectsChange extends Change {
  selection: Array<TreeItem> = []
  prevXfos: Array<Xfo> = []
  newXfos: Array<Xfo> = []
  /**
   * Create a hold objects change.
   *
   * @param data - The data value.
   */
  constructor(data: any) {
    super('HoldObjectsChange')

    if (data) this.update(data)
  }

  /**
   * The undo method.
   */
  undo(): void {
    for (let i = 0; i < this.selection.length; i++) {
      if (this.selection[i] && this.prevXfos[i]) {
        this.selection[i].globalXfoParam.value = this.prevXfos[i]
      }
    }
  }

  /**
   * The redo method.
   */
  redo(): void {
    for (let i = 0; i < this.selection.length; i++) {
      if (this.selection[i] && this.newXfos[i]) {
        this.selection[i].globalXfoParam.value = this.newXfos[i]
      }
    }
  }

  /**
   * The update method.
   * @param updateData - The updateData param.
   */
  update(updateData: any): void {
    if (updateData.newItem) {
      this.selection[updateData.newItemId] = updateData.newItem
      this.prevXfos[updateData.newItemId] = updateData.newItem.globalXfoParam.value
    } else if (updateData.changeXfos) {
      for (let i = 0; i < updateData.changeXfoIds.length; i++) {
        const gidx = updateData.changeXfoIds[i]
        if (!this.selection[gidx]) continue
        this.selection[gidx].globalXfoParam.value = updateData.changeXfos[i]
        this.newXfos[gidx] = updateData.changeXfos[i]
      }
    }
    this.emit('updated', updateData)
  }

  /**
   * The toJSON method.
   * @param context - The context param.
   * @return {object} The return value.
   */
  toJSON(context?: Record<string, any>): Record<string, any> {
    const j: Record<any, any> = super.toJSON(context)

    const itemPaths = []
    for (let i = 0; i < this.selection.length; i++) {
      if (this.selection[i]) {
        itemPaths[i] = this.selection[i].getPath()
      } else {
        itemPaths.push(null)
      }
    }
    j.itemPaths = itemPaths

    return j
  }

  /**
   * The fromJSON method.
   * @param j - The j param.
   * @param context - The context param.
   */
  fromJSON(j: Record<string, any>, context: Record<string, any>): void {
    super.fromJSON(j, context)

    const sceneRoot = context.appData.scene.getRoot()
    this.selection = []
    for (let i = 0; i < j.itemPaths.length; i++) {
      const itemPath = j.itemPaths[i]
      if (itemPath && itemPath != '') {
        const newItem = sceneRoot.resolvePath(itemPath, 1)
        if (newItem != sceneRoot) {
          this.selection[i] = newItem
          this.prevXfos[i] = newItem.globalXfoParam.value
        }
      }
    }
  }
}

UndoRedoManager.registerChange('HoldObjectsChange', HoldObjectsChange)

/**
 * Class representing a VR hold objects tool.
 * @extends BaseTool
 */
class VRHoldObjectsTool extends BaseTool {
  private defaultTaycastDist = 0.0
  public raycastDist = 20.0
  public treeWalkSteps = 1 // Setup up form a body Part

  private appData: AppData
  private pressedButtonCount = 0
  private vrControllers: XRController[] = []
  private heldObjectCount = 0
  private heldTreeItems: Array<TreeItem> = []
  private highlighteTreeItemIds: Array<TreeItem> = [] // controller id to held goem id.
  private heldTreeItemItemIds: Array<number> = [] // controller id to held goem id.
  private heldTreeItemItemRefs: number[][] = []
  private heldTreeItemItemOffsets: Array<Xfo> = []

  private bindControllerId: number
  private change: HoldObjectsChange
  private prevCursor: string

  private pointerGeomItems: GeomItem[] = []
  private prevUpdateGrabXfos: Xfo[] = []

  /**
   * Create a VR hold objects tool.
   * @param appData - The appData value.
   */
  constructor(appData: AppData) {
    super()
    this.appData = appData
  }

  /**
   * The activateTool method.
   */
  activateTool(): void {
    super.activateTool()

    this.prevCursor = this.appData.renderer.getGLCanvas().style.cursor
    this.appData.renderer.getGLCanvas().style.cursor = 'crosshair'

    const bindController = (controller: XRController) => {
      // The tool might already be deactivated.
      if (this.pointerGeomItems[controller.id]) return

      this.defaultTaycastDist = controller.raycastDist
      controller.raycastDist = this.raycastDist

      const pointerGeomItem = new GeomItem('PointerRay', line, lineMaterial)
      pointerGeomItem.setSelectable(false)
      const pointerXfo = new Xfo()
      pointerXfo.sc.set(1, 1, this.raycastDist)
      pointerGeomItem.localXfoParam.value = pointerXfo
      controller.tipItem.addChild(pointerGeomItem, false)
      this.pointerGeomItems[controller.id] = pointerGeomItem
    }

    this.appData.renderer.getXRViewport().then((xrvp) => {
      for (const controller of xrvp.getControllers()) {
        bindController(controller)
      }
      this.bindControllerId = xrvp.on('controllerAdded', (event) => bindController(event.controller))
    })
  }

  /**
   * The deactivateTool method.
   */
  deactivateTool(): void {
    super.deactivateTool()

    this.appData.renderer.getGLCanvas().style.cursor = this.prevCursor
    const unbindController = (controller: XRController) => {
      if (!this.pointerGeomItems[controller.id]) return
      controller.tipItem.removeChildByHandle(this.pointerGeomItems[controller.id])

      controller.raycastDist = this.defaultTaycastDist
      this.pointerGeomItems[controller.id] = null
    }

    this.appData.renderer.getXRViewport().then((xrvp) => {
      for (const controller of xrvp.getControllers()) {
        unbindController(controller)
      }
      xrvp.removeListenerById('controllerAdded', this.bindControllerId)
    })
  }

  // ///////////////////////////////////
  // VRController events

  /**
   * The computeGrabXfo method.
   * @param refs - The refs param.
   * @return {Xfo} The return value.
   */
  computeGrabXfo(refs: number[]): Xfo {
    if (refs.length == 1) {
      return this.vrControllers[refs[0]].getTipXfo()
    } else if (refs.length == 2) {
      const xfo0 = this.vrControllers[refs[0]].getTipXfo()
      const xfo1 = this.vrControllers[refs[1]].getTipXfo()

      xfo0.ori.alignWith(xfo1.ori)

      const grabXfo = new Xfo()
      grabXfo.tr = xfo0.tr.lerp(xfo1.tr, 0.5)
      grabXfo.ori = xfo0.ori.lerp(xfo1.ori, 0.5)

      let vec0 = xfo1.tr.subtract(xfo0.tr)
      vec0.normalizeInPlace()
      const vec1 = grabXfo.ori.getXaxis()
      if (vec0.dot(vec1) < 0.0) vec0 = vec0.negate()

      const angle = vec0.angleTo(vec1)
      if (angle > 0) {
        const axis = vec1.cross(vec0)
        axis.normalizeInPlace()
        const align = new Quat()
        align.setFromAxisAndAngle(axis, angle)
        grabXfo.ori = align.multiply(grabXfo.ori)
      }
      return grabXfo
    }
  }

  /**
   * The initAction method.
   */
  initAction(): void {
    for (let i = 0; i < this.heldTreeItems.length; i++) {
      const heldTreeItem = this.heldTreeItems[i]
      if (!heldTreeItem) continue
      const grabXfo = this.computeGrabXfo(this.heldTreeItemItemRefs[i])
      this.heldTreeItemItemOffsets[i] = grabXfo.inverse().multiply(heldTreeItem.globalXfoParam.value)
      this.prevUpdateGrabXfos[i] = grabXfo
    }
  }

  private setPointerLength(length: number, controller: XRController): void {
    const pointerGeomItem = this.pointerGeomItems[controller.id]
    if (pointerGeomItem) {
      const pointerLocalXfo = pointerGeomItem.localXfoParam.value

      pointerLocalXfo.sc.set(1, 1, length / controller.getTipXfo().sc.z)
      pointerGeomItem.localXfoParam.value = pointerLocalXfo
    }
  }

  /**
   * Event fired when a pointing device button is pressed
   *
   * @param event - The event param.
   */
  onPointerDown(event: ZeaPointerEvent): void {
    if (event instanceof XRControllerEvent && event.button == 0) {
      const id = event.controller.getId()
      this.vrControllers[id] = event.controller

      // const intersectionData = event.controller.getGeomItemAtTip()
      const treeItem = this.highlighteTreeItemIds[id]
      if (treeItem) {
        // if (geomItem.getOwner() instanceof Handle) return false

        // console.log("onMouseDown on Geom"); // + " Material:" + geomItem.getMaterial().name);
        // console.log(geomItem.getPath()) // + " Material:" + geomItem.getMaterial().name);

        let gidx = this.heldTreeItems.indexOf(treeItem)
        if (gidx == -1) {
          gidx = this.heldTreeItems.length
          this.heldObjectCount++
          this.heldTreeItems.push(treeItem)
          this.heldTreeItemItemRefs[gidx] = [id]
          this.heldTreeItemItemIds[id] = gidx

          const changeData = {
            newItem: treeItem,
            newItemId: gidx,
          }
          if (!this.change) {
            this.change = new HoldObjectsChange(changeData)
            UndoRedoManager.getInstance().addChange(this.change)
          } else {
            this.change.update(changeData)
          }
        } else {
          this.heldTreeItemItemIds[id] = gidx
          this.heldTreeItemItemRefs[gidx].push(id)
        }
        this.initAction()
        event.stopPropagation()
      }
    }
  }

  /**
   * Event fired when a pointing device button is released while the pointer is over the tool.
   *
   * @param event - The event param.
   */
  onPointerUp(event: ZeaPointerEvent): void {
    if (event instanceof XRControllerEvent) {
      const id = event.controller.getId()

      this.pressedButtonCount--
      if (this.heldTreeItemItemIds[id] !== undefined) {
        const gidx = this.heldTreeItemItemIds[id]
        const refs = this.heldTreeItemItemRefs[gidx]
        refs.splice(refs.indexOf(id), 1)
        if (refs.length == 0) {
          this.heldObjectCount--
          this.heldTreeItems[gidx] = undefined

          this.change = undefined
        }
        this.heldTreeItemItemIds[id] = undefined
        this.initAction()
        event.stopPropagation()
      }
    }
  }

  onPointerClick(event: ZeaPointerEvent): void {
    if (event instanceof XRControllerEvent) {
      if (event.button == 5) {
        //'B'
        this.treeWalkSteps++
      } else if (event.button == 4) {
        //'A'
        if (this.treeWalkSteps > 0) this.treeWalkSteps--
      }
    }
  }

  /**
   * Event fired when a pointing device is moved
   *
   * @param event - The event param.
   */
  onPointerMove(event: ZeaPointerEvent): void {
    if (event instanceof XRPoseEvent) {
      if (!this.change) {
        event.controllers.forEach((controller: XRController) => {
          const id = controller.getId()
          const intersectionData = controller.getGeomItemAtTip()
          if (intersectionData) {
            this.setPointerLength(intersectionData.dist, controller)

            let treeItem = intersectionData.geomItem
            for (let i = 0; i < this.treeWalkSteps; i++) {
              const parent = treeItem.parent
              if (!parent) break
              treeItem = treeItem.parent
            }
            if (this.highlighteTreeItemIds[id] != treeItem) {
              if (this.highlighteTreeItemIds[id]) {
                this.highlighteTreeItemIds[id].removeHighlight('vrHoldObject')
              }
              treeItem.addHighlight('vrHoldObject', new Color(1, 0, 0, 0.2))
              this.highlighteTreeItemIds[id] = treeItem
            }
          } else {
            this.setPointerLength(this.raycastDist, controller)

            if (this.highlighteTreeItemIds[id]) {
              const treeItem = this.highlighteTreeItemIds[id]
              this.highlighteTreeItemIds[id] = null

              if (!this.highlighteTreeItemIds.includes(treeItem)) {
                treeItem.removeHighlight('vrHoldObject')
              }
            }
          }
        })

        return
      }

      const changeXfos = []
      const changeXfoIds = []
      for (let i = 0; i < this.heldTreeItems.length; i++) {
        const heldTreeItem = this.heldTreeItems[i]
        if (!heldTreeItem) continue
        const currUpdateGrabXfo = this.computeGrabXfo(this.heldTreeItemItemRefs[i])

        const grabXfo = this.prevUpdateGrabXfos[i].lerp(currUpdateGrabXfo, 0.5)
        changeXfos.push(grabXfo.multiply(this.heldTreeItemItemOffsets[i]))
        changeXfoIds.push(i)

        this.prevUpdateGrabXfos[i] = currUpdateGrabXfo
      }

      this.change.update({ changeXfos, changeXfoIds })

      event.stopPropagation()
    }
  }

  /**
   * Event fired when a pointing device button is double clicked on the tool.
   *
   * @param event - The event param.
   */
  onPointerDoublePress(event: ZeaMouseEvent): void {
    if (event instanceof XRControllerEvent) {
      // this.onVRControllerDoubleClicked(event)
    }
  }
}

export default VRHoldObjectsTool
export { VRHoldObjectsTool }
