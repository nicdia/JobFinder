WEB GIS AUFGABEN UND ZIEL
OpenStreetMap-Layer o.ä. --> check
Rasterdaten-Layer (optional)
Vektordaten-Layer (Punkt, Linie, Fläche) --> check
Daten aus einem DBMS u./o. aus Dateien (bspw. GeoJSON) --> check
WMS-Layer
einbinden --> check
bereitstellen (optional, bspw. mit MapServer)
Koordinatenerfassung --> check
Tool zur Pflege der Vektordaten (CRUD)
Routing (optional) --> Openrouteservice
Geolocation (optional)
Nominatim-Tool (optional) --> check
Attribut-Darstellung
Texte und/oder Bilder

OTP Server starten:
java -Xmx8G -jar otp.jar --router current --graphs graphs --server

Doku/UML Modell:
Mermaid angucken--> in Git Markdown

Funktionen die noch kommen müssen:

Jobs speicherbar machen 1. Archiv in DB einrichten für vergangene Jobs 2. im Frontend Button einrichten zum Speichern 3. in Datenbank neue Tabelle saved jobs einrichten mit foreign key user id und job id

Update, Delete Suchaufträge

Usermanagement

Pipeline erweitern
Pipeline für drei verschiedene Suchbegriffe definieren und die enstsprechend im Frontend darstellen
--> DA BIN ICH GERADE DRAN; PIPELINE KANN JETZT NACH DEN DREI BEGRIFFEN SUCHEN, ABER ES MUSS NOCH KORREKT ANGEPASST WERDEN IM FRONTEND UND BACKEND

    --> AUCH NÄCHSTE WOCHE: FÜR DRAW FEATURES MUSS DAS MIT DEN ADRESSUCHE PARAMETERN RAUS + LABEL NAME WIRD NICHT KORREKT ANGEZEIGT WENN MAN EIN POLYGON ZEICHNET, DA WERDEN JA KEINE ISOCHRONE BERECHNET

Drawn Features UPDATE, DELETE --> man soll bereits gezeichnete Features anpassen können und löschen s

archiv in data pipeline erstellen --> darein werden alle generierten Jobs kopiert mit zeitstempel wenn der neue Zyklus beginnt

Legende einrichten

Die Navigation zwischen den Seiten verbessern
Dem Icon wenn man angemeldet ist weitere Funktionen geben
Eigene Position bestimmen + Routing zu einem der Jobs mit der bestimmten Position

BUGLISTE
manchmal kommt ein Fehler wenn man Line über die Alster macht bei der Punktberechnung

es werden noch alle einzelnen Isochrone bei Line Zeichenn ausgegeben aber es soll eigentlich nur Merge geschickt werden --> das ist etwas kompleyer, könnte man lösen indem man in die Isochrone noch ne Spalte macht Type und dann im Frontend filtern wenn Type Linestring, dann filter und nimm nur das was im label merged stehen hat --> oder ein anderes keywort

Der Appheader soll immer mitwandern, wenn man also nach unten zoomt soll er mitwandern dass er nicht manchnal verschwindet --> bei der Karte relevant

Suchauftragsdialog nimmt m/s --> das muss noch umgecodet werden dass er km/h nimmt + dass man auch die Zeit angeben kann die man brauchen will

Wenn man mit Adressuche anpasst fängt es ab da den Loop wieder an, aber es soll wieder zurück in die Übersicht springen
