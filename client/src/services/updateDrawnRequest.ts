// In services/fetchDrawnRequest.ts (or a dedicated service file)
export async function updateDrawnRequest(
  user: any,
  requestId: string | number,
  updatedFeature: any
) {
  const token = user?.token; // assuming user object holds an auth token
  const response = await fetch(`/api/drawnRequests/${requestId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(updatedFeature),
  });
  if (!response.ok) {
    throw new Error("Failed to update the drawn request.");
  }
  return response.json(); // return response data if needed
}
