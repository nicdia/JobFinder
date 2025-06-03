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
Routing (optional)
Geolocation (optional)
Nominatim-Tool (optional) --> check
Attribut-Darstellung
Texte und/oder Bilder

OTP Server starten:
java -Xmx8G -jar otp.jar --router current --graphs graphs --server

Doku/UML Modell:
Mermaid angucken--> in Git Markdown

Funktionen die noch kommen müssen:

1. Man soll seinem Suchauftrag einen Namen geben können und der soll dann auch so in der layer list dargestellt werden
2. Update, Delete Suchaufträge
3. Pipeline für drei verschiedene Suchbegriffe definieren und die enstsprechend im Frontend darstellen
4. archiv in data pipeline erstellen --> darein werden alle generierten Jobs kopiert mit zeitstempel wenn der neue Zyklus beginnt
5. Jobs speicherbar machen
6. Die Navigation zwischen den Seiten verbessern
7. Dem Icon wenn man angemeldet ist weitere Funktionen geben
8. Eigene Position bestimmen + Routing zu einem der Jobs mit der bestimmten Position

BUGLISTE
manchmal kommt ein Fehler wenn man Line über die Alster macht bei der Punktberechnung

es werden noch alle einzelnen Isochrone bei Line Zeichenn ausgegeben aber es soll eigentlich nur Merge geschickt werden --> das ist etwas kompleyer, könnte man lösen indem man in die Isochrone noch ne Spalte macht Type und dann im Frontend filtern wenn Type Linestring, dann filter und nimm nur das was im label merged stehen hat --> oder ein anderes keywort

Der Appheader soll immer mitwandern, wenn man also nach unten zoomt soll er mitwandern dass er nicht manchnal verschwindet --> bei der Karte relevant

Suchauftragsdialog nimmt m/s --> das muss noch umgecodet werden dass er km/h nimmt + dass man auch die Zeit angeben kann die man brauchen will

03.06
--> req_name soll als Feld rein in search areas
--> dafür sorgen dass in search areas statt Benutzer Isochrone lieber {req_name} - Erreichbarkeitsbereich
--> im Frontend statt label aus search_area (Benutzer-Isochrone) soll req_name verwendet werden
