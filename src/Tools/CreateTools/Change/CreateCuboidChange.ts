import { Cuboid, Material, GeomItem, TreeItem, Xfo, Color } from '@zeainc/zea-engine'
import { UndoRedoManager } from '../../../UndoRedo/index'
import CreateGeomChange from './CreateGeomChange'

/**
 * Class representing a create cuboid change.
 *
 * **Events**
 * * **updated:** Triggered when the change is updated
 *
 * @extends CreateGeomChange
 */
class CreateCuboidChange extends CreateGeomChange {
  cuboid = new Cuboid(0, 0, 0, true)
  /**
   * Create a create cuboid change.
   *
   * @param {TreeItem} parentItem - The parentItem value.
   * @param {Xfo} xfo - The xfo value.
   */
  constructor(parentItem: TreeItem, xfo: Xfo, color: Color) {
    super('CreateCuboid')

    const material = new Material('Cuboid', 'SimpleSurfaceShader')
    this.geomItem = new GeomItem('Cuboid', this.cuboid, material)

    if (parentItem && xfo) {
      material.getParameter('BaseColor').setValue(color)
      this.setParentAndXfo(parentItem, xfo)
    }
  }

  /**
   * Updates cuboid using the specified data.
   *
   * @param {object} updateData - The updateData param.
   */
  update(updateData: Record<any, any>) {
    if (updateData.baseSize) {
      this.cuboid.sizeXParam.value = updateData.baseSize[0]
      this.cuboid.sizeYParam.value = updateData.baseSize[1]
    }
    if (updateData.tr) {
      const xfo = this.geomItem.localXfoParam.getValue()
      xfo.tr.fromJSON(updateData.tr)
      this.geomItem.localXfoParam.value = xfo
    }
    if (updateData.height) {
      this.cuboid.sizeZParam.value = updateData.height
    }
    this.emit('updated', updateData)
  }
}

UndoRedoManager.registerChange('CreateCuboidChange', CreateCuboidChange)

export default CreateCuboidChange
export { CreateCuboidChange }
