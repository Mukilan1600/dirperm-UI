import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DirPermComponent extends Component {
  @tracked open = false;

  @action
  toggleOpen(){
    this.open = !this.open;
  }
}
