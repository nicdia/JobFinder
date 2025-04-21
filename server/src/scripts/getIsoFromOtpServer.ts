//////////////// OLD VERSION JUST EXISTiNG FOR COMPARISON CAN BE DELETED AT SOME POINT
////////////////////////////////////////
import { fetchOtpApi } from "../services/geomS_fetchOTPServer";
import { insertUserIsochrone } from "../services/geomS_importIsochrone";

(async () => {
  const result = await fetchOtpApi({
    corDict: {
      testTable: [{ coord: [53.55, 9.99] }], // [lat, lon]
    },
    url: "http://localhost:8080/otp/routers/default/isochrone",
    precision: 10,
    cutoff: 900,
    mode: "WALK",
    speed: 1.4,
    date: "2025-04-14",
    time: "10:00:00",
  });

  const feature = result.results["testTable"]?.[0]?.features?.[0];
  const coord = [9.99, 53.55] as [number, number];

  if (feature) {
    await insertUserIsochrone({
      userId: 1,
      label: "Hamburg Fußweg 15min",
      cutoff: 900,
      mode: "WALK",
      center: coord,
      geojsonPolygon: feature,
    });
  } else {
    console.warn("❌ Keine Isochrone erhalten.");
  }
})();
