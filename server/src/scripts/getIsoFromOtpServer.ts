import { fetchOtpApi } from "../services/otpService";

(async () => {
  const result = await fetchOtpApi({
    corDict: {
      testTable: [{ coord: [53.55, 9.99] }],
    },
    url: "http://localhost:8080/otp/routers/default/isochrone",
    precision: 10,
    cutoff: 900,
    mode: "WALK",
    speed: 1.4,
    date: "2025-04-14",
    time: "10:00:00",
  });

  console.log("Ergebnis:", JSON.stringify(result, null, 2));
})();
