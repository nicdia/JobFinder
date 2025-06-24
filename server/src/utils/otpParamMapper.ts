import { mapFrontendTransportToOtpMode } from "./transportMapper";

export function buildOtpParamsFromDrawnInput(params: any) {
  return {
    mode: mapFrontendTransportToOtpMode(params.transport),
    speed:
      typeof params.speed === "string"
        ? parseFloat(params.speed)
        : params.speed,
    cutoff:
      (typeof params.cutoff === "string"
        ? parseFloat(params.cutoff)
        : params.cutoff) * 60,
    reqName: params.reqName,
  };
}
