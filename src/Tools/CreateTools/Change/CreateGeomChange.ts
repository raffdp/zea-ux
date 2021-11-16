import { Xfo, Color } from '@zeainc/zea-engine'
import Change from '../../../UndoRedo/Change'

/**
 * Class representing a create geom change.
 *
 * @extends Change
 */
class CreateGeomChange extends Change {
  parentItem
  geomItem
  childIndex
  /**
   * Create a create circle change.
   * @param {string} name - The name value.
   */
  constructor(name, parentItem?) {
    super(name)
    this.parentItem = parentItem ? parentItem : null
  }

  /**
   * The setParentAndXfo method.
   * @param {TreeItem} parentItem - The parentItem param.
   * @param {Xfo} xfo - The xfo param.
   */
  setParentAndXfo(parentItem, xfo) {
    this.parentItem = parentItem
    const name = this.parentItem.generateUniqueName(this.geomItem.getName())
    this.geomItem.setName(name)
    this.geomItem.getParameter('GlobalXfo').setValue(xfo)
    this.parentItem.addChild(this.geomItem)

    // this.geomItem.addRef(this) // keep a ref to stop it being destroyed
  }

  /**
   * Removes recently created geometry from its parent.
   */
  undo() {
    this.parentItem.removeChild(this.parentItem.getChildIndex(this.geomItem))
  }

  /**
   * Restores recently created geometry and adds it to the specified parent tree item.
   */
  redo() {
    this.parentItem.addChild(this.geomItem, false, false)
  }

  /**
   * Serializes the change as a JSON object.
   *
   * @param {Record<any, any>} context - The context value
   * @return {Record<any, any>} - The serialized change
   */
  toJSON(context?: Record<any, any>) {
    const j: Record<any, any> = super.toJSON(context)
    j.parentItemPath = this.parentItem.getPath()
    j.geomItemName = this.geomItem.getName()
    j.geomItemXfo = this.geomItem.getParameter('LocalXfo').getValue()

    const material = this.geomItem.getParameter('Material').getValue()
    j.color = material.getParameter('BaseColor').getValue()
    return j
  }

  /**
   * Restores geometry from using the specified JSON
   *
   * @param {object} j - The j param.
   * @param {object} context - The appData param.
   */
  fromJSON(j, context) {
    const sceneRoot = context.appData.scene.getRoot()
    this.parentItem = sceneRoot.resolvePath(j.parentItemPath, 1)
    this.geomItem.setName(this.parentItem.generateUniqueName(j.geomItemName))
    const xfo = new Xfo()
    xfo.fromJSON(j.geomItemXfo)
    this.geomItem.getParameter('LocalXfo').setValue(xfo)
    this.childIndex = this.parentItem.addChild(this.geomItem, false)

    if (j.color) {
      const color = new Color(0.7, 0.2, 0.2)
      color.fromJSON(j.color)
      const material = this.geomItem.getParameter('Material').getValue()
      material.getParameter('BaseColor').setValue(color)
    }
  }

  // updateFromJSON(j) {
  //   if (this.__newValue.fromJSON)
  //     this.__newValue.fromJSON(j.value);
  //   else
  //     this.__newValue = j.value;
  // }

  /**
   * Removes geometry item reference from change change.
   */
  destroy() {
    // this.geomItem.removeRef(this) // remove the tmp ref.
  }
}

export default CreateGeomChange
export { CreateGeomChange }
