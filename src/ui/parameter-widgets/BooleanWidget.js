import BaseWidget from './BaseWidget';

import visualiveUxFactory from '../VisualiveUxFactory';
import ParameterValueChange from '../../undoredo/ParameterValueChange';

class BooleanWidget extends BaseWidget {
  constructor(parameter, parentDomElem, undoRedoManager) {
    super(parameter);

    const input = document.createElement('input');
    // input.className = 'mdl-switch__input';
    input.setAttribute('id', parameter.getName());
    input.setAttribute('type', 'checkbox');
    input.setAttribute('checked', parameter.getValue());
    input.setAttribute('tabindex', 0);

    parentDomElem.appendChild(input);
    // componentHandler.upgradeElement(input);

    /////////////////////////////
    // Handle Changes.

    let settingParameterValue = false;
    parameter.valueChanged.connect(() => {
      if (!settingParameterValue)
        input.setAttribute('checked', parameter.getValue());
    });
    input.addEventListener('input', () => {
      settingParameterValue = true;
      const change = new ParameterValueChange(parameter);
      change.setValue(input.checked);
      undoRedoManager.addChange(change);
      settingParameterValue = false;
    });
  }
}

visualiveUxFactory.registerWidget(
  BooleanWidget,
  p => p.constructor.name == 'BooleanParameter'
);
