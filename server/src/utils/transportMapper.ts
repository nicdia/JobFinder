// src/utils/transportMapper.ts
export function mapFrontendTransportToOtpMode(frontendValue: string): string {
  switch (frontendValue) {
    case "Zu Fuß":
      return "WALK";
    case "Radverkehr":
      return "BICYCLE";
    case "ÖPNV":
      return "TRANSIT";
    default:
      return "WALK"; // Fallback
  }
}
