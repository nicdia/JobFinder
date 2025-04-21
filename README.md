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
Texte und/oder Bi
lder

Zukünftige Features:
User muss was einzeichnen können!! Polyone/Linestrings
--> User kann sein Suchgebiet selbst einzeichnen? auch mehrere Suchgebiete?
--> man kann mehrere Punkte miteinander verbinden als Line und entlang dieser Linie werden Jobs angezeigt
--> vielleicht auch, dass man mehrere POIs für einen selbst einzeichnet Punkte/Linie/Polygone und Jobs in der Nähe dieser Features werden angezeigt
--> Joblistings selbst eintragen?
--> Auth: Anmeldung/Freischaltung
--> Requests: Ein Job Listing anzeigen lassen, an einen Superuser weiterleiten
USABILITY ist wichtig

OTP Server starten:
java -Xmx8G -jar otp.jar --router current --graphs graphs --server

To Do

Data Pipeline

- archiv in data pipeline erstellen --> darein werden alle generierten Jobs kopiert mit zeitstempel wenn der neue Zyklus beginnt

Backend

- Spalte ergänzen dass immer der aktuellste Job ausgegeben werden kann + man suchen kann nach alten ermittelten Jobs aus der Vergangenheit
- Jobs speichern / als Favorit setzen
- ggf. Quick Apply

Frontend
