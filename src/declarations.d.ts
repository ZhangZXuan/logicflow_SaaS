declare module 'logicflow-exclusive-gateway' {
    import type { GraphModel } from '@logicflow/core';

    export const ExclusiveGateway: {
        type: string;
        model: any;
        view: any;
    };

    export class GatewayEngine {
        static execute(node: { id: string; graphModel: GraphModel }, variables: Record<string, any>): any;
    }

    export default ExclusiveGateway;
}