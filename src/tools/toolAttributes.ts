export type DefaultToolAttributes<T extends ToolAttributes> = Omit<
  ExcludeMethods<T>,
  keyof ToolAttributes
>

type ExcludeMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export type ToolAttributeInput = {
  type: 'color',
  label: string
  default: string,
  tooltip?: string,
} | {
  type: 'range',
  label: string
  min: number,
  max: number,
  default: number,
  step?: number,
  tooltip?:string,
} | {
  type: 'checkbox',
  label: string
  checked: boolean,
  tooltip?:string,
} | {
  type: 'select',
  label: string
  options: string[],
  tooltip?:string,
  default: string,
}

export type ToolAttributeInputParam<T extends ToolAttributes> = Partial<
  Record<keyof DefaultToolAttributes<T>, ToolAttributeInput>
>


export default abstract class ToolAttributes {
  toolBoxDiv: HTMLDivElement | null;
  toolAttributesMarkup: string;

  constructor(toolAttributeInput: ToolAttributeInputParam<any>) {
    this.toolAttributesMarkup = this.generateToolMarkup(toolAttributeInput);
    this.toolBoxDiv = document.getElementById(
      "tool-attributes"
    ) as HTMLDivElement | null;
    if (this.toolBoxDiv === null) {
      console.error("toolbox div not present in dom");
    }
    this.insertToolAttributeMarkup();
  }

  private generateToolMarkup(toolAttributeInput: ToolAttributeInputParam<any>): string {
    let inputMarkup = '';
    for (let key in toolAttributeInput) {
      const field = toolAttributeInput[key]
      if (!field) {
        continue;
      }

      let fieldMarkup = '';
      switch (field.type) {
        case 'color':
          fieldMarkup = `<div><label for="${key}">${field.label} </label><input type="color" id="${key}" /></div>`;
          break;
        case 'range':
          fieldMarkup = `<div>
                          <label for="${key}">${field.label} </label>
                          <input type="range" id="${key}" name="${key}" min="${field.min}" max="${field.max}" step="${field.step ?? 1}" value="${field.default}">
                        </div>`;
          break;
        case 'select':
          fieldMarkup = `<div>
                          <label for="${key}">${field.label} </label>
                          <select name="${key}" id="${key}" >
                            ${field.options.map((option) => `<option value=${option} ${field.default === option ? "selected" : ""} >${option}</option>`).join('')}
                          </select>
                        </div>`;
          break;
        case 'checkbox':
          fieldMarkup = `<div>
                          <input type="checkbox" id="${key}" />
                          <label for="${key}" title="${field.tooltip}">${field.label}</label>
                        </div>`;
          break;
      }

      inputMarkup += fieldMarkup;
    }

    return inputMarkup;
  }

  insertToolAttributeMarkup() {
    if (!this.toolBoxDiv) {
      return;
    }

    this.toolBoxDiv.innerHTML = `<fieldset><legend>Tool Attributes</legend>${this.toolAttributesMarkup}</fieldset>`;
  }

  destroy() {
    if (!this.toolBoxDiv) {
      return;
    }
    this.toolBoxDiv = null;
  }

  abstract events(): void;
  abstract removeEvents(): void;
  abstract getAttributes(): DefaultToolAttributes<any>;
}
