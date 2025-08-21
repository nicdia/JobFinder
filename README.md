                            WEB GIS AUFGABEN UND ZIEL

OpenStreetMap-Layer o.ä. --> check
Vektordaten-Layer (Punkt, Linie, Fläche) --> check
Daten aus einem DBMS u./o. aus Dateien (bspw. GeoJSON) --> check
Koordinatenerfassung --> check
Tool zur Pflege der Vektordaten (CRUD) --> check
Geolocation (optional) --> check
Nominatim-Tool (optional) --> check
Attribut-Darstellung --> check

                                Noch Offen - Aufgabenstellung

Rasterdaten-Layer (optional)
WMS-Layer einbinden / bereitstellen (optional, bspw. mit MapServer)
Routing (optional) --> Openrouteservice
Bilder im Attribut einstellen?

                            OTP Server starten - nicht mehr nötig in Docker:

java -Xmx8G -jar otp.jar --router current --graphs graphs --server
Doku/UML Modell:
Mermaid angucken--> in Git Markdown

                            Doockercontainer starten

docker compose up -d
docker compose logs -f --tail=100
docker compose logs -f --tail=100
docker compose logs -f api # nur Backend
docker compose logs -f client # nur Frontend
docker compose logs -f otp # OTP
docker compose logs -f db # DB
docker compose ps -- ports und status angucken der container
docker compose build api client && docker compose up -d -- nach Codeänderungen
docker compose run --rm pipeline -- pipeline starten einmalig

                    Funktionen die noch kommen müssen:

sicherstellen dass bei Geokodierung nur Adressen in Hamburg akzeptiert werden + evtl. eine geojson einladen womit man filtern kann das alles außerhalb ausgegraut wird auf der Karte

Jobs speicherbar machen --> im Frontend Button einrichten zum Speichern, in Datenbank neue Tabelle saved jobs einrichten mit foreign key user id und job id --> CRUD

Usermanagement - CRUD

Responsive

INIT SQL einrichten

                                    BUGLISTE

manchmal kommt ein Fehler wenn man Line über die Alster macht bei der Punktberechnung

Wenn man in der Map wohin klickt, kommt trotzdem ein Eintrag mit Namen "Job Eintrag" - soll nur kommen wenn man auf ein Job klickt

AKTUELL
Meine drawn search request tabelle
