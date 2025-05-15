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
Texte und/oder Bi
lder

OTP Server starten:
java -Xmx8G -jar otp.jar --router current --graphs graphs --server

Doku/UML Modell:
Mermaid angucken--> in Git Markdown

Funktionen die noch kommen müssen:

- wenn man selbst etwas einzeichnet, dann soll das auch dargestellt werden und nicht nur die resultierenden Isochrone

- archiv in data pipeline erstellen --> darein werden alle generierten Jobs kopiert mit zeitstempel wenn der neue Zyklus beginnt

Eigene Position bestimmen + Routing zu einem der Jobs mit der bestimmten Position

Jobs speicherbar machen

Pipeline für drei verschiedene Suchbegriffe definieren und die enstsprechend im Frontend darstellen

Im Frontend die Namen der Suchaufträge Namen geben könnne

Die Navigation zwischen den Seiten verbessern

Dem Icon wenn man angemeldet ist weitere Funktionen geben

BUGLISTE
manchmal kommt ein Fehler wenn man Line über die Alster macht bei der Punktberechnung
es werden noch alle einzelnen Isochrone bei Line Zeichenn ausgegeben aber es soll eigentlich nur Merge geschickt werden
Der Appheader soll immer mitwandern, wenn man also nach unten zoomt soll er mitwandern dass er nicht manchnal verschwindet --> bei der Karte relevant
