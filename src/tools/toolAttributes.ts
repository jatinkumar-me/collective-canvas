export type DefaultToolAttributes<T> = Omit<T, keyof ToolAttributes>;

export default class ToolAttributes {
  toolBoxDiv: HTMLDivElement | null;
  constructor() {
    this.toolBoxDiv = document.getElementById('toolbox') as HTMLDivElement | null;
    if (this.toolBoxDiv === null) {
      console.error("toolbox div not present in dom")
    }
  }

  events() {
  }
}
