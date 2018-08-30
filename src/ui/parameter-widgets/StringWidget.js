
class StringWidget extends BaseWidget {
  constructor(parameter, parentDomElem){
    super(parameter)

    const input = document.createElement('input');
    input.className = 'mdl-textfield__input'
    input.setAttribute('id', parameter.getName() );
    input.setAttribute('type', 'text')
    input.setAttribute('value', parameter.getValue() )
    input.setAttribute('tabindex', 0 )

    parentDomElem.appendChild(inputOwner);
    componentHandler.upgradeElement(input);

    /////////////////////////////
    // Handle Changes.

    let change = undefined;
    parameter.valueChanged.connect(()=>{
      if(!change)
        input.value = parameter.getValue();
    })
    input.addEventListener('input', ()=>{
      if(!change) {
        change = new ParameterValueChange(parameter);
        undoRedoManager.addChange(change)
      }
      change.setValue(input.valueAsNumber)
    });
    input.addEventListener('change', ()=>{
      if(!change) {
        change = new ParameterValueChange(parameter);
        undoRedoManager.addChange(change)
      }
      change.setValue(input.valueAsNumber)
      change = undefined;
    });
  }

}


parameterWidgetFactory.registerWidget(StringWidget, (p) => p.constructor.name == 'StringParameter')