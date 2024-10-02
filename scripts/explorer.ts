import { observable, autorun, makeAutoObservable, runInAction } from 'mobx';
import { createTransformer } from 'mobx-utils';

type Config = {
  filter: string | null;
};

const config = observable<Config>({
  filter: null,
});

class Folder {
  parent: Folder | null;
  name: string;
  children: Folder[] = [];

  constructor(parent: Folder | null, name: string) {
    this.parent = parent;
    this.name = name;
    makeAutoObservable(this, {
      children: observable.shallow,
    });
  }
}

class FolderView {
  public collapsed = false;
  constructor(
    private folder: Folder,
    private config: Config
  ) {
    makeAutoObservable(this);
  }

  get name() {
    return this.folder.name;
  }
  get isVisible(): boolean {
    return (
      this.config.filter === null ||
      this.name.includes(this.config.filter) ||
      this.children.some((child) => child.isVisible)
    );
  }
  get children(): FolderView[] {
    return !this.collapsed
      ? this.folder.children
          .map(transformFolder)
          .filter((child) => child.isVisible)
      : [];
  }
  get path(): string {
    return this.folder.parent !== null
      ? `${transformFolder(this.folder.parent).path}/${this.name}`
      : this.name;
  }
}

// TODO: find a way to to inject config
const transformFolder = createTransformer<Folder, FolderView>(
  (folder) => new FolderView(folder, config)
);

// returns list of strings per folder
const stringTransformer = createTransformer(
  ({ path, children }: FolderView): string => {
    const appendix = children
      .filter((child) => child.isVisible)
      .map(stringTransformer)
      .join('');
    return `${path}\n${appendix}`;
  }
);

const createView = () => {
  type State = {
    folderView: FolderView | null;
    root: Folder;
  };

  const state = observable<State>({
    folderView: null,
    root: new Folder(null, 'root'),
  });

  const dispose = autorun(() => {
    const view = transformFolder(state.root);
    state.folderView = view;

    const text = stringTransformer(view);
    console.log(text);
  });

  runInAction(() => {
    createFolders(state.root, 2); // 3^2
  });

  return state.folderView;
};

function createFolders(parent: Folder, recursion: number) {
  for (let i = 0; i < 3; i++) {
    const folder = new Folder(parent, i.toString());
    parent.children.push(folder);
    if (recursion > 1) createFolders(folder, recursion - 1);
  }
}

// @ts-expect-error window property access
window.state = createView();
