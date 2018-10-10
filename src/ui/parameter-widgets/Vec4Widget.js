import BaseWidget from './BaseWidget';

import visualiveUxFactory from '../VisualiveUxFactory';
import ParameterValueChange from '../../undoredo/ParameterValueChange';

class Vec4Widget extends BaseWidget {
  constructor(parameter, parentDomElem, undoRedoManager) {
    super(parameter);

    const container = document.createElement('div');
    container.className = 'container';

    const ul = document.createElement('ul');
    ul.className = 'flex-editvalues';
    container.appendChild(ul);

    const xField = document.createElement('input');
    // xField.className = 'mdl-textfield__input'
    xField.setAttribute('id', parameter.getName());
    xField.setAttribute('type', 'number');
    xField.setAttribute('pattern', '-?[0-9]*(.[0-9]+)?');
    xField.setAttribute('value', parameter.getValue().x);
    xField.setAttribute('tabindex', 0);
    xField.style.width = '100%';

    const xli = document.createElement('li');
    xli.appendChild(xField);
    ul.appendChild(xli);

    const yField = document.createElement('input');
    // yField.className = 'mdl-textfield__input'
    yField.setAttribute('id', parameter.getName());
    yField.setAttribute('type', 'number');
    yField.setAttribute('pattern', '-?[0-9]*(.[0-9]+)?');
    yField.setAttribute('value', parameter.getValue().y);
    yField.setAttribute('tabindex', 0);
    yField.style.width = '100%';

    const yli = document.createElement('li');
    yli.appendChild(yField);
    ul.appendChild(yli);

    const zField = document.createElement('input');
    // zField.className = 'mdl-textfield__input'
    zField.setAttribute('id', parameter.getName());
    zField.setAttribute('type', 'number');
    zField.setAttribute('pattern', '-?[0-9]*(.[0-9]+)?');
    zField.setAttribute('value', parameter.getValue().z);
    zField.setAttribute('tabindex', 0);
    zField.style.width = '100%';

    const zli = document.createElement('li');
    zli.appendChild(zField);
    ul.appendChild(zli);

    const tField = document.createElement('input');
    // tField.className = 'mdl-textfield__input'
    tField.setAttribute('id', parameter.getName());
    tField.setAttribute('type', 'number');
    tField.setAttribute('pattern', '-?[0-9]*(.[0-9]+)?');
    tField.setAttribute('value', parameter.getValue().t);
    tField.setAttribute('tabindex', 0);
    tField.style.width = '100%';

    const tli = document.createElement('li');
    tli.appendChild(tField);
    ul.appendChild(tli);

    parentDomElem.appendChild(container);

    /////////////////////////////
    // Handle Changes.

    let change = undefined;

    parameter.valueChanged.connect(() => {
      if (!change) {
        const vec4 = parameter.getValue();
        xField.value = vec4.x;
        yField.value = vec4.y;
        zField.value = vec4.z;
        tField.value = vec4.t;
      }
    });

    const valueChange = () => {
      if (!change) {
        change = new ParameterValueChange(parameter);
        undoRedoManager.addChange(change);
      }
      change.setValue(
        new Visualive.Vec4(
          xField.valueAsNumber,
          yField.valueAsNumber,
          zField.valueAsNumber,
          tField.valueAsNumber
        )
      );
    };

    const valueChangeEnd = () => {
      valueChange();
      change = undefined;
    };

    xField.addEventListener('input', valueChange);
    yField.addEventListener('input', valueChange);
    zField.addEventListener('input', valueChange);
    tField.addEventListener('input', valueChange);

    xField.addEventListener('change', valueChangeEnd);
    yField.addEventListener('change', valueChangeEnd);
    zField.addEventListener('change', valueChangeEnd);
    tField.addEventListener('change', valueChangeEnd);
  }
}

visualiveUxFactory.registerWidget(
  Vec4Widget,
  p => p.constructor.name == 'Vec4Parameter'
);
