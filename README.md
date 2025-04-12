WEB GIS AUFGABEN UND ZIEL
OpenStreetMap-Layer o.ä.
Rasterdaten-Layer (optional)
Vektordaten-Layer (Punkt, Linie, Fläche)
Daten aus einem DBMS u./o. aus Dateien (bspw. GeoJSON)
WMS-Layer
einbinden
bereitstellen (optional, bspw. mit MapServer)
Koordinatenerfassung
Tool zur Pflege der Vektordaten (CRUD)
Routing (optional)
Geolocation (optional)
Nominatim-Tool (optional)
Attribut-Darstellung
Texte und/oder Bilder

TO DO
--> kontrollieren ob das alles passt mit der neuen Codestruktur + besonders das mainPipeline Skript checken --> check
--> Laufen lassen mit nur Hamburg Daten --> check
--> Input im Frontend bauen, dass man seine Addresse eingeben kann
--> OTP Server anbinden
--> Isochrone berechnen --> alle Listings die in den Isochronen liegen anzeigen lassen

OTP Server starten:
java -Xmx8G -jar otp.jar --router current --graphs graphs --server
