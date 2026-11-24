# Omas kleine Wiesenwelt — WebAR

Statische MindAR-/A-Frame-Anwendung ohne Backend oder Build-Schritt.

## Start und GitHub Pages

1. Den Inhalt dieses Ordners in das Repository kopieren. `index.html`, `targets.mind`, `js`, `assets` und `style.css` liegen zusammen im Repository-Hauptverzeichnis.
2. GitHub → Settings → Pages → Deploy from a branch → main → / (root) → Save.
3. Die veröffentlichte HTTPS-Adresse auf dem Smartphone in Safari (iOS) oder Chrome (Android) öffnen, „Für Marta 💚“ antippen und Kamera erlauben.
4. Die zum vorhandenen `targets.mind` gehörende gedruckte Karte flach hinlegen. Ganze Karte bei gutem Licht erfassen, anschließend leicht schräg darauf schauen.

Alle Pfade sind relativ und funktionieren auch unter `https://NAME.github.io/REPOSITORY/`.
Für lokale Desktop-Vorschau: `python -m http.server 8080` im Projektordner, dann `http://localhost:8080/?preview=1` öffnen. Die Vorschau benötigt keine Kamera. Smartphone-Zugriff über eine normale HTTP-LAN-Adresse erlaubt keine Kamera; dafür HTTPS verwenden.

## Anpassen

`js/config.js`: Positionen, Höhen, Blumenverteilung, Wolken, Wind, Gehgeschwindigkeit, Flügelfrequenz, Trackingfilter und Targetindex.

Eine Einheit entspricht der Kartenbreite. MindAR-Target: X rechts, Y zur Kartenoberkante, Z aus dem Papier heraus. Der Szeneninhalt wird einmal um +90° um X gedreht. Innerhalb der Szene bedeutet `[x, höhe, tiefe]`: X rechts, Y senkrecht über dem Papier, Z zum vorderen Kartenrand. Die Wiese liegt dadurch exakt parallel zur XY-Targetebene; Figuren stehen senkrecht darauf. Der minimale Bodenabstand vermeidet Z-Fighting.

- Oma besteht aus Körper und zwei getrennten, an den Hüften schwingenden Beinen.
- Rollator: Originalillustration und vier räumlich versetzte Radinstanzen.
- Blumen und Gras: aus Originaldateien isolierte Pflanzen, Drehpunkt am Boden, unterschiedliche Windphasen.
- Schmetterlinge: räumliche Sinusbahnen und alternierende Originalbilder je Farbe.
- Wolken: zwei isolierte Bildteile auf der hinteren Ebene.
- Alle Bewegungen sind JavaScript-Loops; die gemeinsame Uhr pausiert bei Trackingverlust und verborgenem Browser-Tab.
- Cutout-Materialien nutzen Alpha-Test und Depth-Write statt fehleranfälliger transparenter Flächensortierung. Die Kanten sind bewusst als klare Papierkanten ausgeführt. Weiche Silhouettenschatten als leichte Bodenprojektionen ohne Shadow-Maps; keine Videos.

## Dateien und Assets

Die Original-PNGs bleiben unverändert in `assets/`. Zur Laufzeit lädt die Anwendung ausschließlich kompakte, zugeschnittene PNGs in `assets/optimized/` (Boden maximal 1536 px, Figuren 768 px, isolierte Pflanzen 512 px). `js/assets.json` enthält die Texturabmessungen und Quell-Ausschnitte. Die gestrichelten Schmetterlingslinien werden nicht als fliegende Objekte eingesetzt.

`tools/prepare_assets.py` kann die Texturen mit Python und Pillow neu erstellen. Der mitgelieferte Bestand ist bereits vorbereitet; Python ist für das Hosting nicht erforderlich.

`targets.mind` wurde unverändert übernommen. Voreinstellung ist Target 0. Das Druckbild ist nicht durch die grüne Bodentextur ersetzbar: Die Karte muss zum kompilierten Target passen. Ein zusätzliches Referenzbild war in dieser Sitzung nicht zugänglich; die Gestaltung basiert auf den vorhandenen PNGs.

## Abhängigkeiten

Versionsfest per HTTPS-CDN eingebunden: A-Frame 1.5.0 (MIT) und MindAR 1.2.5 (MIT). Deshalb ist beim Laden eine Internetverbindung nötig. Die Bilder und das Target werden lokal vom eigenen GitHub-Pages-Projekt geladen. Kein kostenpflichtiger Dienst und kein Backend.

Dokumentation: https://hiukim.github.io/mind-ar-js-doc/installation/ und https://aframe.io/docs/1.5.0/ .

## Abnahme auf echten Geräten

Vor Veröffentlichung mit der tatsächlichen Druckkarte prüfen:
- Safari/iPhone und Chrome/Android: Kamerafreigabe, Tracking, erneutes Finden nach Verdeckung.
- Boden deckt die Illustration; Figuren stehen aus schrägem Blickwinkel auf der Wiese.
- Vier Räder, zwei bewegliche Beine und drei Farben mit je zwei Flügelbildern sichtbar.
- Blumen hinter/vor Oma werden räumlich korrekt verdeckt.
- Wechsel in Hintergrund und zurück, Drehen des Geräts, Kamera beenden.

Ein realer Smartphone-/Kameratest ist in der Entwicklungsumgebung nicht erfolgt. Die Bild-Tracking-Qualität hängt von der vorhandenen Targetdatei, dem Druck und der Beleuchtung ab; Filterwerte können Zittern reduzieren, aber verlorenes Tracking nicht ersetzen.


## Durchgeführte Entwicklungsprüfungen

JavaScript-Syntaxprüfung bestanden. Der automatisierte Szenentest (`node tools/test-scene.cjs` im Projektordner) prüft den Aufbau von 61 Meshes, vier Räder, zwei Beine, sechs Flügelbilder, Bodenausrichtung, Tiefenschreiben, Pausieren/Fortsetzen bei Trackingereignissen und endliche Animationswerte. Er verwendet einen vereinfachten Three.js-Testadapter und ersetzt keinen WebGL-/Browser-Test. Alle 65 Texturpfade sind vorhanden; die Targetdatei ist per SHA-256 identisch zum Original.

Ein Browser-Rendering konnte wegen blockierter lokaler Netzwerkverbindungen in dieser Sitzung nicht geprüft werden. Die Bibliotheken werden deshalb versionsfest über die offiziellen CDN-URLs geladen; auch deren Erreichbarkeit muss im Zielbrowser gegeben sein.

## Überarbeitung: Anordnung nach Originalvorlage

Blumen und Gras verwenden jetzt sämtliche isolierten Originalelemente genau einmal. Ihre ursprüngliche Links-rechts-Reihenfolge bleibt erhalten; innerhalb jeder Tiefengruppe werden die Positionen gleichmäßig zwischen −0,43 und +0,43 verteilt. Die Tiefe wird je Quelldatei über `plants.depths` gesteuert. Die Größen entsprechen den Originalverhältnissen. Das ersetzt die vorherige freie Kreis-/Reihenanordnung. Da die Elemente aufrecht stehen, ist das Ergebnis eine räumliche Interpretation und keine perspektivisch identische Kopie des flachen Bilds.

Oma und Rollator teilen einen gemeinsamen Figurenursprung; der Rollator liegt minimal (0,008 Kartenbreiten) davor. Ein gemeinsamer Maßstab und die ursprünglichen Bildkoordinaten erhalten die Zuordnung zwischen Händen und Griffen. Omas Bildebene liegt 0,003 Einheiten vor dem Figurenursprung; das Gestell 0,008. So liegen die überlappenden Hand-/Griffpixel nicht auf derselben Tiefenposition. Die Beinansätze sind entsprechend der Originaldateien weiter auseinander; die Beine reichen bis zur gemeinsamen Bodenebene. Der Körper wippt nur noch um 0,002 Karteneinheiten, damit die Hände dicht an den Griffen bleiben.

Die Räder sind auf den sichtbaren Bildinhalt zugeschnitten, haben einen Durchmesser von 0,098 Kartenbreiten und rotieren kontinuierlich. Zwei liegen 0,009 Einheiten vor, zwei ebenso knapp hinter dem Gestell. Wolken verwenden jetzt den Faktor 1,70 gegenüber der ersten Fassung (rund 17 Prozent größer als in der vorherigen Fassung).

Einstellungen: `character.scale/position` für das Figurenpaar; `walker.wheelDiameter/wheelDepth/wheelSpeed/wheelMounts` für die Räder; `cloudScale` für die Wolken. Die Quellkoordinaten in `js/assets.json` bestimmen Pflanzengröße und Links-rechts-Reihenfolge; `plants.depths` bestimmt die Tiefenstaffelung. `plants.halfWidth` und `plants.depthSpread` steuern Verteilungsbreite und kleine Tiefenabweichungen. Erweiterte Szenentests prüfen auch diese Koordinaten, die gemeinsame Tiefenebene, Radgrößen, Vor-/Hinterordnung und vollständige Radrotation. Ein tatsächlicher WebGL-/Kameratest steht weiterhin aus.


## Drehbare Vorschau und Ebenen

`?preview=1`: mit Maus oder einem Finger ziehen, um rund um die Szene zu drehen und den Blickwinkel zu neigen. Mausrad oder zwei Finger zoomen. Die Schaltfläche „Ansicht zurücksetzen“ stellt den Ausgangsblick wieder her. Nach Fokus auf die Szene funktionieren auch Pfeiltasten, +/− und R. Die Kamera bleibt aus; die AR-Ansicht erhält keine manuellen Drehsteuerungen. `js/preview.js` enthält die Steuerung und begrenzt Zoom und Neigung.

Pflanzen von hinten nach vorne (negative Z-Werte sind hinten):

| Quelldatei | Tiefe |
| --- | ---: |
| gras_hinten_mitte | −0,44 |
| gras_hinten_links | −0,40 |
| gras_hinten_rechts | −0,37 |
| gras_rechts_hinten_2 | −0,23 |
| gras_mitte | −0,19 |
| blumen_1 | −0,15 |
| gras_vordere_mitte | 0,14 |
| blumen_2 | 0,20 |
| blumen_3 | 0,39 |
| gras_vorne | 0,44 |

Die vier Radpositionen werden aus den Stangenenden der Originalillustration berechnet (`walker.wheelMounts`). Die ersten beiden Räder und das ganz linke Rad liegen knapp vor dem Gestell; das übrige hintere Rad wird teilweise vom Gestell bzw. der Tasche verdeckt. Die Höhen folgen den im Bild perspektivisch versetzten Stangenenden.

Validierung dieser Fassung: `node tools/test-scene.cjs` und `node tools/test-preview.cjs`. Geprüft werden die Tiefenreihenfolge, Radanschlüsse, Hand-/Griffabstand sowie Maus-/Touch-Ereignisse, Pinch-Zoom, Grenzen, Tastatur und Zurücksetzen mit Testadaptern. Das ist keine visuelle WebGL- oder Smartphone-Abnahme.


## Gleichmäßigere Verteilung und Bodenschatten

Die vier Pflanzengruppen bleiben in ihrer bisherigen Reihenfolge. Innerhalb jeder Gruppe werden Blumen und Gräser gemeinsam gleichmäßig über die Breite verteilt und um maximal 0,018 Kartenbreiten in der Tiefe variiert. Die Originalgrößen bleiben erhalten.

Der Rollator ist mit `walker.depthOffset: 0.008` minimal vor Oma verschoben. Beim Rad mit Original-X-Position 1465 (ganz links) ist `front: true` gesetzt, sodass es vor dem Gestell liegt.

Auf dem Boden liegen acht weiche, transparente Silhouettenprojektionen: Körper, beide Beine, Gestell und vier Räder. Sie nutzen die vorhandenen Alpha-Texturen und folgen den Animationen. Die Lichtwirkung ist künstlerisch festgelegt und nicht von der realen Raumbeleuchtung abhängig. `shadows.opacity`, `length`, `height` und `softness` steuern Deckkraft, Schattenlänge, Bodenabstand und weiche Kanten. Die Schatten schreiben selbst keine Tiefenwerte, testen aber gegen die bereits gezeichneten Figuren, damit sie nicht auf die Figuren gemalt werden.

Syntax- und Szenentests bestanden, einschließlich gleichmäßiger Pflanzenabstände, Position von Rollator/linkem Rad und acht flachen Schattenprojektionen. Shaderkompilierung und Erscheinungsbild müssen weiterhin im tatsächlichen Browser geprüft werden.


## Abschiedsgruß für Marta und Tracking-Glättung

Startkachel: „Für unsere Lieblingserbse“ mit Abschiedsgruß der ver.di Jugend; Startbutton: „Für Marta 💚“. Nach erfolgreicher Erkennung wird die Statusmeldung ausgeblendet; bei Trackingverlust erscheint der Suchhinweis wieder.

Tracking versuchsweise stärker geglättet: filterMinCF von 0.001 auf 0.0005, filterBeta von 10 auf 1. Das kann Zittern reduzieren, führt aber zu mehr Nachlauf bei Kamerabewegungen. Die Erkennungs-/Verlusttoleranzen bleiben unverändert. Ein Vergleich auf dem Smartphone mit der gedruckten Karte steht aus. Bei störendem Nachlauf zuerst filterBeta wieder erhöhen.

Für die Targetdatei die unverzerrte, exakt zum Druck passende Bildvorlage verwenden, kein schräg aufgenommenes Foto. Im MindAR-Compiler auf viele über die Bildfläche verteilte Merkmale achten. Die vorhandene targets.mind wurde nicht ersetzt; die zugehörige vollständige Druckvorlage liegt hier nicht eindeutig vor. Sehr flache Blickwinkel, Reflexionen und unscharfe Kamerabilder können durch Glättung nicht ausgeglichen werden. Erst die ganze Karte von weiter oben erfassen und dann langsam absenken; die Karte gut beleuchten und eben halten.

Referenz: https://hiukim.github.io/mind-ar-js-doc/quick-start/tracking-config/ und https://hiukim.github.io/mind-ar-js-doc/quick-start/compile/ .
