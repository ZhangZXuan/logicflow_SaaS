import LogicFlow, {
    CircleNode,
    CircleNodeModel,
    GraphModel,
} from '@logicflow/core';


export type CustomProperties = {
    nodeType: 'start' | 'approval' | 'condition' | 'end',//卡片类型
    className: string,//卡片的样式属性
    formId?: string,//绑定表单id
    limitTime?: number,//截止时间
    icon: string,
    approveRole?: string,//审批人
    // 形状属性
    r: number;

    // 文字位置属性
    refX?: number;
    refY?: number;

    // 样式属性
    style?: LogicFlow.CommonTheme;
    textStyle?: LogicFlow.TextNodeTheme;
};
class CustomCircleModel extends CircleNodeModel {
    override properties: CustomProperties;
    constructor(data: any, graphModel: GraphModel) {
        data.text = {
            // 自定义文本坐标：向下移动40px
            value: data.text as string,
            x: data.x,
            y: data.y,
        };
        super(data, graphModel);


        this.properties = {
            // 默认值
            nodeType: data.properties?.nodeType || 'approval',
            className: data.properties?.className || '',
            formId: data.properties?.formId || '',
            limitTime: data.properties?.limitTime,
            icon: data.properties?.icon || '',
            approveRole: data.properties?.approveRole || '',

            // 形状
            r: data.properties?.r || 30,
            // 文字偏移
            refX: data.properties?.refX || 0,
            refY: data.properties?.refY || 0,

            // 样式
            textStyle: data.properties?.textStyle,
            style: data.properties?.style,

        };
        this.setAttributes();
    }
    setAttributes() {
        const { r = 10 } = this.properties;
        this.r = r;
    }
    getNodeData() {
        const data = super.getNodeData();
        data.properties = this.properties;
        return data;
    }

}


export default {
    type: 'custom-circle',
    view: CircleNode,
    model: CustomCircleModel,
};