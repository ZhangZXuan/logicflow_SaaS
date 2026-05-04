import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { LogicNode } from '../logicFlow/flow';

// 1. 类型定义
export type Statetype = {
    flowName: string;
    nodes: Array<LogicNode>;
    edges: Array<any>;
};

// 2. 初始状态
const initialState: Statetype[] = [];

// 3. 创建 Slice
const flowSlice = createSlice({
    name: 'flow',
    initialState,
    reducers: {
        // 加入数据
        setFlowData: (state, action) => {
            console.log('payload', action.payload)
            console.log('type', action.type)
            console.log('处理前 state:', state)

            // 将新数据添加到数组中
            state.push({
                flowName: action.payload.flowName,
                nodes: action.payload.nodes,
                edges: action.payload.edges
            });

            console.log('处理后 state:', state)
        },
        // 清空
        resetFlow: () => initialState
    }
});

// 3. 导出 Action
export const { setFlowData, resetFlow } = flowSlice.actions;

// 4. 创建 Store
export const store = configureStore({
    reducer: {
        flow: flowSlice.reducer
    }
});

// 5. 严格类型导出
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 6. 默认导出
export default store;
