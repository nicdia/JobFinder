WEB GIS AUFGABEN UND ZIEL
OpenStreetMap-Layer o.ä. --> check
Vektordaten-Layer (Punkt, Linie, Fläche) --> check
Daten aus einem DBMS u./o. aus Dateien (bspw. GeoJSON) --> check
Koordinatenerfassung --> check
Tool zur Pflege der Vektordaten (CRUD) --> Create + Read implementiert
Geolocation (optional) --> check
Nominatim-Tool (optional) --> check
Attribut-Darstellung --> check

Noch Offen
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

Funktionen die noch kommen müssen:

Update, Delete Suchaufträge --> DAS ALS NÄCHSTES

Jobs speicherbar machen 1. Archiv in DB einrichten für vergangene Jobs 2. im Frontend Button einrichten zum Speichern 3. in Datenbank neue Tabelle saved jobs einrichten mit foreign key user id und job id

Usermanagement

Pipeline erweitern
Pipeline für drei verschiedene Suchbegriffe definieren und die enstsprechend im Frontend darstellen
--> DA BIN ICH GERADE DRAN; PIPELINE KANN JETZT NACH DEN DREI BEGRIFFEN SUCHEN, ABER ES MUSS NOCH KORREKT ANGEPASST WERDEN IM FRONTEND UND BACKEND

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

Wenn man in der Map wohin klickt, kommt trotzdem ein Eintrag mit Namen "Job Eintrag" - soll nur kommen wenn man auf ein Job klickt

LETZTER STAND 17.06
AKTUELL IM FRONTEND+BACKEND DRAWN POLYGON VERHALTEN ANPASSEN
