import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import { getPreservedDimension } from "../utils/utils";
import Shape from "./shape";
import ToolAttributes, {
  DefaultToolAttributes, ToolAttributeInputParam,
} from "./toolAttributes";
import { ToolName } from "./toolManager";

const DEFAULT_IMAGE_TOOL_ATTRIBUTES: DefaultToolAttributes<ImageToolAttributes> =
{
  imageData: undefined,
  preserveAspectRatio: true,
};

const IMAGE_TOOL_ATTRIBUTE_INPUT: ToolAttributeInputParam<ImageToolAttributes> =
{
  imageData: {
    type: 'image',
    label: 'Image',
    default: '',
  },
  preserveAspectRatio: {
    type: 'checkbox',
    label: 'Preserve aspect ratio',
    default: true,
  }
}

const IMAGE_TOOL_INFO_MARKUP: string = `<b>NOTE:</b> Image tool currently doesn't support multi user feature, changes made with image tool are local only.`

export class ImageToolAttributes extends ToolAttributes {
  imageData?: HTMLImageElement;
  preserveAspectRatio: boolean;
  toolName: string;

  private imageInput: HTMLInputElement;
  private preserveAspectRatioInput: HTMLInputElement;

  private imageChangeListener: EventListener;
  private preserveAspectRatioListener: EventListener;

  constructor(defaultAttribs: DefaultToolAttributes<ImageToolAttributes>) {
    super(
      defaultAttribs,
      IMAGE_TOOL_ATTRIBUTE_INPUT,
      IMAGE_TOOL_INFO_MARKUP,
    );
    this.preserveAspectRatio = defaultAttribs.preserveAspectRatio;

    this.imageInput = document.getElementById(
      "imageData"
    ) as HTMLInputElement;
    this.preserveAspectRatioInput = document.getElementById(
      "preserveAspectRatio"
    ) as HTMLInputElement;

    this.imageChangeListener = this.setImage.bind(this);
    this.preserveAspectRatioListener = this.setPreserveAspectRatio.bind(this);
    this.toolName = 'image'
    this.events();
  }

  events(): void {
    this.imageInput.addEventListener('change', this.imageChangeListener);
    this.preserveAspectRatioInput.addEventListener('change', this.preserveAspectRatioListener);
  }

  removeEvents(): void {
    this.imageInput.removeEventListener('change', this.imageChangeListener);
    this.preserveAspectRatioInput.removeEventListener('change', this.preserveAspectRatioListener);
  }

  async setImage(): Promise<void> {
    const fileList = this.imageInput.files
    if (!fileList) {
      console.error("No image uploaded")
      return;
    }
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      const res = event.target?.result
      if (!res) {
        return;
      }
      img.src = res.toString();
      this.imageData = img;
    }

    reader.readAsDataURL(fileList[0]);
  }

  setPreserveAspectRatio(): void {
    this.preserveAspectRatio = this.preserveAspectRatioInput.checked;
  }

  getAttributes(draw: boolean): DefaultToolAttributes<any> {
    let imgSrc;
    if (draw && this.imageData) {
      // imgSrc = this.imageData.src;
      imgSrc = btoa(this.imageData.src); //TODO: Made it send binary imageData.
    }
    return {
      imageData: imgSrc ?? new Image(),
      preserveAspectRatio: this.preserveAspectRatio,
    };
  }
}


export default class ImageTool extends Shape {
  toolAttrib: ImageToolAttributes;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(
      baseLayer,
      connection,
      state,
      ToolName.IMAGE,
    );
    this.toolAttrib = new ImageToolAttributes(
      this.retrieveToolAttributes() ?? DEFAULT_IMAGE_TOOL_ATTRIBUTES);
  }

  drawShape(ctx: CanvasRenderingContext2D,) {
    ImageTool.drawImage(ctx, this.mouseLastClickPosition, this.mouseLastPosition, this.toolAttrib);
  }

  /**
   * Static method for drawing a image, using a single point and dimensions
   */
  static drawImage(
    ctx: CanvasRenderingContext2D,
    startPoint: [number, number],
    endPoint: [number, number],
    toolAttrib: DefaultToolAttributes<ImageToolAttributes>
  ) {
    if (!toolAttrib.imageData) {
      console.warn("Must select an image first");
      return;
    }
    let width = endPoint[0] - startPoint[0];
    let height = endPoint[1] - startPoint[1];

    if (toolAttrib.preserveAspectRatio) {
      const { height: imageH, width: imageW } = toolAttrib.imageData;
      const aspectRatio = imageW / imageH;
      [width, height] = getPreservedDimension(width, height, aspectRatio)
    }

    ctx.drawImage(toolAttrib.imageData, startPoint[0], startPoint[1], width, height);
  }
}
