import { DiamondNodeModel } from "@logicflow/core";

export default class ExclusiveGatewayModel extends DiamondNodeModel {
    constructor(data: any, graphModel: any) {
        super(data, graphModel);
    }

    get width() {
        return 80;
    }

    get height() {
        return 80;
    }

    // 修正锚点位置，和自定义宽高同步
    getAnchors() {
        const { x, y } = this;
        const w = this.width;
        const h = this.height;
        return [
            { x: x + w / 2, y: y }, // 上锚点
            { x: x + w, y: y + h / 2 }, // 右锚点
            { x: x + w / 2, y: y + h }, // 下锚点
            { x: x, y: y + h / 2 }, // 左锚点
        ];
    }

    // 网关校验逻辑保持不变
    validate() {
        const incomings = this.graphModel.getIncomingEdges(this.id);
        const outgoings = this.graphModel.getOutgoingEdges(this.id);

        if (incomings.length === 0) {
            return { valid: false, message: "必须有入边" };
        }
        if (outgoings.length === 0) {
            return { valid: false, message: "必须有出边" };
        }

        const defaultEdges = outgoings.filter((e: any) => e.properties?.isDefault);
        if (defaultEdges.length > 1) {
            return { valid: false, message: "只能有 1 条默认流" };
        }

        return { valid: true };
    }
}