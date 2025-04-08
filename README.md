To Do

mit den 25 gefetchten Features erstmal schauen dass a) die keys aus der json gezogen werden und dass das Spalten werden und b) die Adresse geokodiert wird.
zu b) Mit Google Maps? NOMINATIM SOGAR ERWÄHNT WORDEN
--> das kommt dann in base

dann eine zweite Api abrufen und auch die umpacken in base

dann testweise mal gucken ob und wie die Daten verknüpft werden können --> in mart

die mart Tabelle dann mal schicken ans Frontend und in der Karte darstellen

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

Prompt für Chat:
Hey Chat, wir arbeiten an meinem WebGIS-Projekt mit Jobs.
Ich hab zuletzt BA-Jobdaten als JSONB in `stage.raw_jobs_ba_api` gespeichert.
Jetzt geht’s darum:

- JSON-Felder zu extrahieren und in `base.jobs_ba` zu packen
- Adresse (`arbeitsort`) zu geokodieren (→ `geom`)
- Dann eine zweite API anbinden und auch in base bringen
- Dann alle in `mart.jobs` vereinheitlichen
- Und testweise mal ans Frontend senden & auf der Map darstellen
