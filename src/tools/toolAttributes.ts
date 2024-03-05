export type DefaultToolAttributes<T extends ToolAttributes> = Omit<
  ExcludeMethods<T>,
  keyof ToolAttributes
>

type ExcludeMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export type ToolAttributesMarkup<T extends ToolAttributes> = Partial<
  Record<keyof DefaultToolAttributes<T>, string>
>;

export default abstract class ToolAttributes {
  toolBoxDiv: HTMLDivElement | null;
  toolAttributesMarkup: Record<string, string>

  constructor(toolAttributesMarkup: Record<string, string>) {
    this.toolAttributesMarkup = toolAttributesMarkup;
    this.toolBoxDiv = document.getElementById(
      "tool-attributes"
    ) as HTMLDivElement | null;
    if (this.toolBoxDiv === null) {
      console.error("toolbox div not present in dom");
    }
    this.insertToolAttributeMarkup();
  }

  insertToolAttributeMarkup() {
    if (!this.toolBoxDiv) {
      return;
    }

    const toolBoxInnerHTML = Object.values(this.toolAttributesMarkup).join('');
    this.toolBoxDiv.innerHTML = `<fieldset><legend>Tool Attributes</legend>${toolBoxInnerHTML}</fieldset>`;
  }

  destroy() {
    if (!this.toolBoxDiv) {
      return;
    }
    this.toolBoxDiv = null;
  }

  abstract events(): void;
  abstract removeEvents(): void;
}
