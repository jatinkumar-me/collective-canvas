export type DefaultToolAttributes<T> = Omit<
  ExcludeMethods<T>,
  keyof ToolAttributes
>;

type ExcludeMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export type ToolAttributesMarkup<T> = Partial<
  Record<keyof DefaultToolAttributes<T>, string>
>;

export default class ToolAttributes {
  toolBoxDiv: HTMLDivElement | null;
  constructor() {
    this.toolBoxDiv = document.getElementById(
      "tool-attributes"
    ) as HTMLDivElement | null;
    if (this.toolBoxDiv === null) {
      console.error("toolbox div not present in dom");
    }
  }

  events() {}
}
