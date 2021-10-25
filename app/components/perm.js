import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

class DirectoryPermissions {
  @tracked folder_name;
  @tracked permissions;

  constructor(folder_name, permissions) {
    this.folder_name = folder_name;
    this.permissions = permissions.map(
      (perm) =>
        new Permissions(
          perm.accessType,
          perm.sidType,
          perm.read,
          perm.write,
          perm.readNExecute,
          perm.delete,
          perm.fullControl,
          perm.userName
        )
    );
  }
}

class Permissions {
  @tracked accessType;
  @tracked read;
  @tracked write;
  @tracked readNExecute;
  @tracked can_delete;
  @tracked full_control;
  @tracked userName;
  @tracked sidType;

  constructor(accessType, sidType, read, write, readNExecute, can_delete, fullControl, userName) {
    this.accessType = accessType;
    this.sidType = sidType;
    this.read = read;
    this.write = write;
    this.readNExecute = readNExecute;
    this.can_delete = can_delete;
    this.userName = userName;
    this.full_control = fullControl;
  }

  toJson() {
    return {
      userName: this.userName,
      read: this.read,
      write: this.write,
      readNExecute: this.readNExecute,
      delete: this.can_delete,
      fullControl: this.full_control,
      accessType: this.accessType,
    };
  }
}

export default class PermComponent extends Component {
  @tracked msg = '';
  @tracked folder_name = '';
  @tracked user_name = '';
  @tracked curr_perms = [];
  @tracked curr_dirs = [];
  @tracked allow_perms = new Permissions('GRANT', '', false, false, false, false, false, '');
  @tracked deny_perms = new Permissions('DENY', '', false, false, false, false, false, '');
  @tracked level = 0;
  @tracked loading = false;

  @action
  async onGetPermissions() {
    this.loading = true;
    const fetch_url = `http://localhost:8080/dirperm/folderperm?depth=${
      this.level
    }&folder_name=${encodeURI(this.folder_name)}`;
    const res = await fetch(fetch_url);
    const dirs = await res.json();
    this.curr_dirs = dirs.map((dir) => {
      return new DirectoryPermissions(dir.folderName, dir.permissionEntries);
    });
    if (this.curr_dirs.length == 0) this.msg = 'No folders at this level';
    this.loading = false;
  }

  @action
  async onSetPermissions() {
    this.allow_perms.userName = this.user_name;
    this.deny_perms.userName = this.user_name;

    const fetch_url = `http://localhost:8080/dirperm/folderperm`;
    const res = await fetch(fetch_url, {
      method: 'POST',
      body: JSON.stringify({
        folderName: this.folder_name,
        entries: [this.allow_perms.toJson(), this.deny_perms.toJson()],
      }),
    });

    console.log(res.body);
  }

  @action
  updatePerms(accessType, event) {
    const { name, checked } = event.target;
    if (accessType == 'allow') {
      this.allow_perms[name] = checked;
      if (checked) this.deny_perms[name] = false;
    }
    if (accessType == 'deny') {
      this.deny_perms[name] = checked;
      if (checked) this.allow_perms[name] = false;
    }
    console.log(this.allow_perms);
    // this.curr_perms[name]=checked;
  }

  @action
  updateLevel(event) {
    this.level = event.target.value;
  }
}
