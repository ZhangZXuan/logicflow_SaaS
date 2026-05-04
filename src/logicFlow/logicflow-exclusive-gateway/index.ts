import ExclusiveGatewayModel from "./ExclusiveGatewayModel";
import ExclusiveGatewayView from "./ExclusiveGateView";
import { ExclusiveGatewayEngine } from "./ExclusiveGatewayEngine";

const ExclusiveGateway = {
    type: "exclusiveGateway",
    model: ExclusiveGatewayModel,
    view: ExclusiveGatewayView,
};

export { ExclusiveGateway, ExclusiveGatewayEngine };
export default ExclusiveGateway;