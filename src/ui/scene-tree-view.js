import visualiveUxFactory from './VisualiveUxFactory';
import undoRedoManager from '../undoredo/UndoRedoManager';
import ParameterValueChange from '../undoredo/ParameterValueChange';

class TreeItemElement {
  constructor(treeItem, parentDomElement, expanded = false) {
    this.parentDomElement = parentDomElement;
    this.treeItem = treeItem;

    this.li = document.createElement('li');
    this.li.className = 'TreeNodesListItem';

    this.expandBtn = document.createElement('button');
    this.expandBtn.className = 'TreeNodesListItem__Toggle';
    this.li.appendChild(this.expandBtn);

    // Visibility toggle.
    this.toggleVisibilityBtn = document.createElement('button');
    this.toggleVisibilityBtn.className = 'TreeNodesListItem__ToggleVisibility';
    this.li.appendChild(this.toggleVisibilityBtn);
    this.toggleVisibilityBtn.innerHTML =
      '<i class="material-icons md-15">visibility</i>';

    const visibleParam = this.treeItem.getParameter('Visible');

    this.toggleVisibilityBtn.addEventListener('click', () => {
      const change = new ParameterValueChange(visibleParam);
      change.setValue(!visibleParam.getValue());
      undoRedoManager.addChange(change);
    });

    visibleParam.valueChanged.connect(() => {
      const visible = visibleParam.getValue();
      visible
        ? this.li.classList.remove('TreeNodesListItem--isHidden')
        : this.li.classList.add('TreeNodesListItem--isHidden');
    });

    // Title element.
    this.titleElement = document.createElement('span');
    this.titleElement.className = 'TreeNodesListItem__Title';
    this.titleElement.textContent = treeItem.getName();
    this.li.appendChild(this.titleElement);

    const selectedParam = this.treeItem.getParameter('Selected');

    this.titleElement.addEventListener('click', () => {
      const change = new ParameterValueChange(selectedParam);
      change.setValue(!selectedParam.getValue());
      undoRedoManager.addChange(change);
    });

    selectedParam.valueChanged.connect(() => {
      const selected = selectedParam.getValue();
      selected
        ? this.li.classList.add('TreeNodesListItem--isSelected')
        : this.li.classList.remove('TreeNodesListItem--isSelected');
    });

    this.parentDomElement.appendChild(this.li);

    this.ul = document.createElement('ul');
    this.ul.className = 'TreeNodesList';
    this.li.appendChild(this.ul);

    this.childElements = [];
    this._expanded = false;
    const children = this.treeItem.getChildren();
    if (children.length) {
      this.expandBtn.addEventListener('click', () => {
        this._expanded ? this.collapse() : this.expand();
      });

      if (expanded) {
        this.expand();
      } else {
        this.expandBtn.innerHTML =
          '<i class="material-icons md-24">arrow_right</i>';
      }
    }

    this.treeItem.childAdded.connect((childItem, index) => {
      this.addChild(childItem, this.ul);
    });

    this.treeItem.childRemoved.connect((childItem, index) => {});
  }

  addChild(treeItem, parentDomElement, expanded = false) {
    const childTreeItem = visualiveUxFactory.constructTreeItemElement(
      treeItem,
      parentDomElement,
      expanded
    );
    this.childElements.push(childTreeItem);
    this.expandBtn.innerHTML =
      '<i class="material-icons md-24">arrow_drop_down</i>';
    this.expandBtn.addEventListener('click', () => {
      this._expanded ? this.collapse() : this.expand();
    });

    if (expanded) {
      this.expand();
    } else {
      this.expandBtn.innerHTML =
        '<i class="material-icons md-24">arrow_right</i>';
    }
  }

  expand() {
    this._expanded = true;
    this.ul.classList.remove('TreeNodesList--collapsed');
    this.expandBtn.innerHTML =
      '<i class="material-icons md-24">arrow_drop_down</i>';

    if (!this.childrenAlreadyCreated) {
      const children = this.treeItem.getChildren();
      for (let child of children) {
        this.addChild(child, this.ul);
      }
      this.childrenAlreadyCreated = true;
    }
  }

  collapse() {
    this.ul.classList.add('TreeNodesList--collapsed');
    this.expandBtn.innerHTML =
      '<i class="material-icons md-24">arrow_right</i>';
    this._expanded = false;
  }
}

visualiveUxFactory.registerTreeItemElement(
  TreeItemElement,
  p => p.constructor.name === 'TreeItem'
);

class GeomItemElement extends TreeItemElement {
  constructor(treeItem, parentDomElement, expanded = false) {
    super(treeItem, parentDomElement, expanded);
  }
}

visualiveUxFactory.registerTreeItemElement(
  GeomItemElement,
  p => p.constructor.name === 'GeomItem'
);

class SceneTreeView {
  constructor(parentDomElement, rootTreeItem) {
    this.parentDomElement = parentDomElement;

    this.ul = document.createElement('ul');
    this.ul.className = 'TreeNodesList TreeNodesList--root';

    this.parentDomElement.appendChild(this.ul);

    this.rootElement = new TreeItemElement(rootTreeItem, this.ul, true);
  }

  getDomElement() {
    return this.container;
  }
}

export default SceneTreeView;
