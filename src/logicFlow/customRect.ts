import LogicFlow, { RectNode, RectNodeModel } from '@logicflow/core'

// interface FLowNodeProperties{

// }

export type CustomProperties = {
  nodeType: 'start' | 'approval' | 'condition' | 'end',//卡片类型
  className: string,//卡片的样式属性
  formId: string,//绑定表单id
  limitTime?: number,//截止时间
  icon: string,
  approveRole: string,//审批人
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  // 文字位置属性
  refX?: number;
  refY?: number;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomRectNode extends RectNode { }

class CustomRectModel extends RectNodeModel {
  override properties: CustomProperties;
  constructor(data: any, graphModel: any) {
    super(data, graphModel)
    this.properties = {
      // 默认值
      nodeType: data.properties?.nodeType || 'approval',
      className: data.properties?.className || '',
      formId: data.properties?.formId || '',
      limitTime: data.properties?.limitTime,
      icon: data.properties?.icon || '',
      approveRole: data.properties?.approveRole || '',

      // 形状
      width: data.properties?.width || 150,
      height: data.properties?.height || 75,
      radius: data.properties?.radius || 10,

      // 文字偏移
      refX: data.properties?.refX || 0,
      refY: data.properties?.refY || 0,

      // 样式
      style: data.properties?.style,
      textStyle: data.properties?.textStyle,
    };
    this.setAttributes();
  }
  // 设置矩形的形状属性：大小和圆角
  setAttributes() {
    const { width = 150, height = 75, radius = 10 } = this.properties;
    this.width = width;
    this.height = height;
    this.radius = radius;
  }

  // 重写文本样式属性
  override getTextStyle(): LogicFlow.TextNodeTheme {
    const { refX = 0, refY = 0, textStyle } = this.properties;
    const style = super.getTextStyle();

    // 通过 transform 重新设置 text 的位置：向下移动70px
    return {
      ...style,
      ...textStyle,
      transform: `matrix(1 0 0 1 ${refX} ${refY + 60})`,
    };
  }

  // 设置矩形的样式属性：边框颜色
  override getNodeStyle() {
    const style = super.getNodeStyle();
    const { style: customStyle } = this.properties;

    return {
      ...style,
      stroke: '#1677ff', // 你要的蓝色边框
      strokeWidth: 2,
      fill: '#ffffff',
      ...customStyle, // 允许外部覆盖样式
    };
  }
  getNodeData() {
    const data = super.getNodeData();
    data.properties = this.properties;
    return data;
  }

}

export default {
  type: 'custom-rect',
  view: CustomRectNode,
  model: CustomRectModel,
};