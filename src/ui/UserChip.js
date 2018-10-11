
import { getCurrentUser } from '../PlatformAPI.js';

export class UserChip {
  constructor(domElement){
    this.domElement = domElement;
    this.clean();
    this.userDiv = document.createElement('div');
    this.userDiv.className = 'user-chip';
    this.domElement.appendChild(this.userDiv);

    this.userNameSpan = document.createElement('span');
    this.userNameSpan.className = 'user-name';
    this.userDiv.appendChild(this.userNameSpan);

    this.userImageDiv = document.createElement('div');
    this.userImage = document.createElement('img');
    this.userImage.className = 'user-image br-100 ba b--black-10';
    this.userImage.alt = 'Avatar';
    this.userImage.src = "https://placeimg.com/150/150/tech";
    this.userImageDiv.appendChild(this.userImage);
    this.userDiv.appendChild(this.userImageDiv);
  }

  clean(){
    while (this.domElement.firstChild) {
        this.domElement.removeChild(this.domElement.firstChild);
    }
  }

  unmount(){
    this.clean();
  }
}


export class CurrentUserChip extends UserChip {
  constructor(domElement){
    super(domElement)
    getCurrentUser()
      .then(currentUser => {
        this.userNameSpan.innerHTML = currentUser.name;
        // this.userNameSpan.src = currentUser.image;
      })
      .catch(() => {
        console.error('Error getting current user.');
      });
  }
}