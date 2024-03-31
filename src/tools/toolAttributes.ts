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
  tooltip?: string,
} | {
  type: 'checkbox',
  label: string
  default: boolean,
  tooltip?: string,
} | {
  type: 'select',
  label: string
  options: string[],
  tooltip?: string,
  default: string,
} | {
  type: 'text-area',
  label: string,
  placeholder: string,
  default: string,
} | {
  type: 'image',
  label: string,
  default: string,
}

export type ToolAttributeInputParam<T extends ToolAttributes> = Partial<
  Record<keyof DefaultToolAttributes<T>, ToolAttributeInput>
>

export default abstract class ToolAttributes {
  toolBoxDiv: HTMLDivElement | null;
  toolInfoDiv: HTMLDivElement | null;
  toolAttributesMarkup: string;
  toolInfoMarkup?: string;
  abstract toolName: string;

  constructor(
    defaultAttribs: DefaultToolAttributes<any>,
    toolAttributeInput: ToolAttributeInputParam<any>,
    toolInfoMarkup?: string
  ) {
    this.toolAttributesMarkup = this.generateToolMarkup(toolAttributeInput, defaultAttribs);
    this.toolInfoMarkup = toolInfoMarkup;
    this.toolBoxDiv = document.getElementById(
      "tool-attributes"
    ) as HTMLDivElement | null;
    if (this.toolBoxDiv === null) {
      console.error("toolbox div not present in dom");
    }
    this.toolInfoDiv = document.getElementById(
      "tool-info"
    ) as HTMLDivElement | null;
    if (this.toolBoxDiv === null) {
      throw new Error("toolbox div not present in dom");
    }
    this.insertToolAttributeMarkup();
    this.insertToolInfo();
  }


  private generateToolMarkup(
    toolAttributeInput: ToolAttributeInputParam<any>,
    defaultAttribs: DefaultToolAttributes<any>
  ): string {
    let inputMarkup = '';
    for (let key in toolAttributeInput) {
      const field = toolAttributeInput[key]
      if (!field) {
        continue;
      }

      field.default = defaultAttribs[key]; // Assign default value

      let fieldMarkup = '';
      switch (field.type) {
        case 'color':
          fieldMarkup = `<div><label for="${key}">${field.label} </label><input type="color" id="${key}" value="${field.default}" /></div>`;
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
                          <input type="checkbox" id="${key}" ${field.default ? "checked" : ""}/>
                          <label for="${key}" title="${field.tooltip}">${field.label}</label>
                        </div>`;
          break;
        case "text-area":
          fieldMarkup = `<div>
                          <div><label for="${key}">${field.label} </label></div>
                          <textarea id="${key}" rows="${3}" required placeholder="${field.placeholder}" autofocus >${field.default}</textarea>
                        </div>`
          break;
        case "image":
          fieldMarkup = `<div>
                          <label for="${key}">${field.label}</label>
                          <input type="file" id="${key}" accept="image/*">
                        </div `
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

  insertToolInfo() {
    if (!this.toolInfoDiv) {
      return;
    }
    this.toolInfoDiv.innerHTML = this.toolInfoMarkup ?? "";
  }

  destroy() {
    if (!this.toolBoxDiv) {
      return;
    }
    this.toolBoxDiv = null;
  }

  saveToolAttributes() {
    const toolAttribString = JSON.stringify(this.getAttributes());
    localStorage.setItem(this.toolName, toolAttribString);
  }

  abstract events(): void;
  abstract removeEvents(): void;
  abstract getAttributes(draw?: boolean): DefaultToolAttributes<any>;
}
