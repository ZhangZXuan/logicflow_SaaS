export class ExclusiveGatewayEngine {
    static execute(gatewayNode: any, inputValue: string | number) {
        const outgoings = gatewayNode.graphModel.getOutgoingEdges(gatewayNode.id);
        if (!outgoings || outgoings.length === 0) return null;

        // 把用户输入转成数字
        const inputNum = Number(inputValue);
        if (isNaN(inputNum)) return null;

        // 1. 先找默认分支
        const defaultEdge = outgoings.find((e: any) => e.properties.isDefault);

        // 2. 遍历所有出线，判断条件
        for (const edge of outgoings) {
            if (edge.properties.isDefault) continue;

            // ============================
            // 核心：用户在连线上写的条件（如 >3）
            // ============================
            const condition = edge.text?.value || edge.properties?.condition;
            if (!condition) continue;

            try {
                // ============================
                // 拼接成可执行的判断： 5 > 3
                // ============================
                const expression = `${inputNum} ${condition}`;
                const result = new Function(`return ${expression}`)();

                if (result) {
                    return edge; // 条件成立，返回这条边
                }
            } catch (err) {
                console.log("条件格式错误：", condition);
            }
        }

        // 3. 都不满足 → 返回默认边
        return defaultEdge;
    }
}