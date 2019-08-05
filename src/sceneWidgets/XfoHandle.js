import SceneWidget from './SceneWidget.js';
import {
  LinearMovementSceneWidget
} from './LinearMovementSceneWidget.js';
import {
  PlanarMovementSceneWidget
} from './PlanarMovementSceneWidget.js';
import {
  AxialRotationSceneWidget
} from './AxialRotationSceneWidget.js';
import {
  LinearScaleSceneWidget
} from './LinearScaleSceneWidget.js';

export default class XfoHandle extends Visualive.TreeItem {
  constructor(name) {
    super(name)

    const size = 0.4
    const thickness = 0.005
    //////////////////////////////////
    // LinearMovementSceneWidget
    
    const translationHandles = new Visualive.TreeItem('Translate');
    translationHandles.setVisible(false);
    this.addChild(translationHandles); 


    const red = new Visualive.Color(1, 0.1, 0.1);
    const green = new Visualive.Color('#32CD32'); // limegreen https://www.rapidtables.com/web/color/green-color.html
    const blue = new Visualive.Color('#1E90FF'); // dodgerblue https://www.rapidtables.com/web/color/blue-color.html

    {
      const linearXWidget = new LinearMovementSceneWidget(
        'linearX',
        size,
        thickness,
        red
      );
      const xfo = new Visualive.Xfo();
      xfo.ori.setFromAxisAndAngle(new Visualive.Vec3(0, 1, 0), Math.PI * 0.5);
      linearXWidget.getParameter('LocalXfo').setValue(xfo)
      translationHandles.addChild(linearXWidget);
    } {
      const linearYWidget = new LinearMovementSceneWidget(
        'linearY',
        size,
        thickness,
        green
      );
      const xfo = new Visualive.Xfo();
      xfo.ori.setFromAxisAndAngle(new Visualive.Vec3(1, 0, 0), Math.PI * -0.5);
      linearYWidget.getParameter('LocalXfo').setValue(xfo)
      translationHandles.addChild(linearYWidget);
    } {
      const linearZWidget = new LinearMovementSceneWidget(
        'linearZ',
        size,
        thickness,
        blue
      );
      translationHandles.addChild(linearZWidget);
    }

    //////////////////////////////////
    // planarXYWidget
    const planarSize = size * 0.25;
    {
      const planarXYWidget = new PlanarMovementSceneWidget(
        'planarXY',
        planarSize,
        green
      );
      const xfo = new Visualive.Xfo();
      xfo.tr.set(planarSize * 0.5, planarSize * 0.5, 0.0)
      planarXYWidget.getParameter('LocalXfo').setValue(xfo)
      translationHandles.addChild(planarXYWidget);
    } {
      const planarYZWidget = new PlanarMovementSceneWidget(
        'planarYZ',
        planarSize,
        red
      );
      const xfo = new Visualive.Xfo();
      xfo.tr.set(0.0, planarSize * 0.5, planarSize * 0.5)
      xfo.ori.setFromAxisAndAngle(new Visualive.Vec3(0, 1, 0), Math.PI * 0.5);
      planarYZWidget.getParameter('LocalXfo').setValue(xfo)
      translationHandles.addChild(planarYZWidget);

    } {
      const planarXZWidget = new PlanarMovementSceneWidget(
        'planarXZ',
        planarSize,
        blue
      );
      const xfo = new Visualive.Xfo();
      xfo.tr.set(planarSize * 0.5, 0.0, planarSize * 0.5)
      xfo.ori.setFromAxisAndAngle(new Visualive.Vec3(1, 0, 0), Math.PI * 0.5);
      planarXZWidget.getParameter('LocalXfo').setValue(xfo)
      translationHandles.addChild(planarXZWidget);
    }

    //////////////////////////////////
    // Rotation
    const rotationHandles = new Visualive.TreeItem('Rotate');
    rotationHandles.setVisible(false);
    this.addChild(rotationHandles); 

    {
      const rotationXWidget = new AxialRotationSceneWidget(
        'rotationX',
        size,
        thickness,
        red
      );
      const xfo = new Visualive.Xfo();
      xfo.ori.setFromAxisAndAngle(new Visualive.Vec3(0, 1, 0), Math.PI * 0.5);
      rotationXWidget.getParameter('LocalXfo').setValue(xfo)
      rotationHandles.addChild(rotationXWidget);
    } {
      const rotationYWidget = new AxialRotationSceneWidget(
        'rotationY',
        size,
        thickness,
        green
      );
      const xfo = new Visualive.Xfo();
      xfo.ori.setFromAxisAndAngle(new Visualive.Vec3(1, 0, 0), Math.PI * 0.5);
      rotationYWidget.getParameter('LocalXfo').setValue(xfo)
      rotationHandles.addChild(rotationYWidget);
    } {
      const rotationZWidget = new AxialRotationSceneWidget(
        'rotationZ',
        size,
        thickness,
        blue
      );
      rotationHandles.addChild(rotationZWidget);
    }

    //////////////////////////////////
    // Scale - Not supported
    const scaleHandles = new Visualive.TreeItem('Scale');
    scaleHandles.setVisible(false);
    this.addChild(scaleHandles);

    const scaleHandleLength = size * 0.95;
    {
      const scaleXWidget = new LinearScaleSceneWidget(
        'scaleX',
        scaleHandleLength,
        thickness,
        red
      );
      const xfo = new Visualive.Xfo();
      xfo.ori.setFromAxisAndAngle(new Visualive.Vec3(0, 1, 0), Math.PI * 0.5);
      scaleXWidget.getParameter('LocalXfo').setValue(xfo)
      scaleHandles.addChild(scaleXWidget);
    } {
      const scaleYWidget = new LinearScaleSceneWidget(
        'scaleY',
        scaleHandleLength,
        thickness,
        green
      );
      const xfo = new Visualive.Xfo();
      xfo.ori.setFromAxisAndAngle(new Visualive.Vec3(1, 0, 0), Math.PI * -0.5);
      scaleYWidget.getParameter('LocalXfo').setValue(xfo)
      scaleHandles.addChild(scaleYWidget);
    } {
      const scaleZWidget = new LinearScaleSceneWidget(
        'scaleZ',
        scaleHandleLength,
        thickness,
        blue
      );
      scaleHandles.addChild(scaleZWidget);
    }
  }

  showHandles(name) {
    this.traverse(item => {
      if(item != this) {
        item.setVisible(false)
        return false;
      }
    })

    const child = this.getChildByName(name);
    if(child)
      child.setVisible(true);
  }

  setTargetParam(param) {
    this.__param = param;
    this.traverse(item => {
      if (item instanceof SceneWidget)
        item.setTargetParam(param, false);
    })
  }
};