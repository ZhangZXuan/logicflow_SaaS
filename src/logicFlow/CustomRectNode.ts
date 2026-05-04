// import { RectNode, RectNodeModel } from '@logicflow/core'
// import type IRectNodeProps from '@logicflow/core'

// class CustomRectNode extends RectNode {

// }

// class CustomRectModel extends RectNodeModel<IRectNodeProps> {
//     getTextStyle() {
//         const style = super.getTextStyle()
//         style.position = 'relative'
//         style.left = 'auto'
//         style.right = 'auto'
//         style.transform = 'none'
//         style.fillColor = style.fillColor || '#000000'
//         style.fontSize = style.fontSize || 12
//         return style
//     }
// }
// export default {
//     type: 'customrect',
//     view: CustomRectNode,
//     model: CustomRectModel
// }

import { RectNode, RectNodeModel } from '@logicflow/core'

class CustomRectNode extends RectNode {
    // 保持默认实现，确保缩放控制点正常显示
}

class CustomRectModel extends RectNodeModel {
    constructor(data: any, graphModel: any) {
        super(data, graphModel)
        this.resizable = true // 允许缩放
        this.lockRatio = false // 自由缩放
    }
    getTextStyle() {
        const style = super.getTextStyle()
        style.position = 'relative'

        style.transform = 'none'
        style.fillColor = style.fillColor || '#000000'
        style.fontSize = style.fontSize || 12
        return style
    }
}

export default {
    type: 'customrect',
    view: CustomRectNode,
    model: CustomRectModel
}