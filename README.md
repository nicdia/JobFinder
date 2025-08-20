                            WEB GIS AUFGABEN UND ZIEL

OpenStreetMap-Layer o.ä. --> check
Vektordaten-Layer (Punkt, Linie, Fläche) --> check
Daten aus einem DBMS u./o. aus Dateien (bspw. GeoJSON) --> check
Koordinatenerfassung --> check
Tool zur Pflege der Vektordaten (CRUD) --> Create + Read implementiert
Geolocation (optional) --> check
Nominatim-Tool (optional) --> check
Attribut-Darstellung --> check

                                Noch Offen - Aufgabenstellung

Rasterdaten-Layer (optional)
WMS-Layer
einbinden / bereitstellen (optional, bspw. mit MapServer)
Tool zur Pflege der Vektordaten (CRUD) --> Update + Delete
Routing (optional) --> Openrouteservice
Bilder im Attribut einstellen?

OTP Server starten:
java -Xmx8G -jar otp.jar --router current --graphs graphs --server
Doku/UML Modell:
Mermaid angucken--> in Git Markdown

Doockercontainer starten

docker compose up -d
docker compose logs -f --tail=100

                        Funktionen die noch kommen müssen:

Update, Delete Suchaufträge + Geometrien --> DAS ALS NÄCHSTES

Jobs speicherbar machen --> im Frontend Button einrichten zum Speichern, in Datenbank neue Tabelle saved jobs einrichten mit foreign key user id und job id

Legende einrichten

Die Navigation zwischen den Seiten verbessern

Dem Icon wenn man angemeldet ist weitere Funktionen geben

Eigene Position bestimmen + Routing zu einem der Jobs mit der bestimmten Position

Usermanagement

BUGLISTE
manchmal kommt ein Fehler wenn man Line über die Alster macht bei der Punktberechnung

Der Appheader soll immer mitwandern, wenn man also nach unten zoomt soll er mitwandern dass er nicht manchnal verschwindet --> bei der Karte relevant

Wenn man in der Map wohin klickt, kommt trotzdem ein Eintrag mit Namen "Job Eintrag" - soll nur kommen wenn man auf ein Job klickt
