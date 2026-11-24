# pea-web-ar

WebAR-Abschiedskarte für Marta von der ver.di Jugend. Die Webseite erkennt die gedruckte Karte und zeigt darauf eine animierte Szene. Eine Vorschau ohne Kamera ist ebenfalls verfügbar.

Statische Webseite mit A-Frame 1.5.0 und MindAR 1.2.5. Kein Backend und kein Build-Schritt.

## Starten

Die Seite auf dem Smartphone öffnen, „Für Marta 💚“ antippen und den Kamerazugriff erlauben. Die Karte vollständig ins Bild nehmen. Nach der Erkennung verschwindet der Suchhinweis.

Über „Ohne Kamera ansehen“ oder `?preview=1` lässt sich die Szene ohne Kamerazugriff öffnen:

- Ziehen mit Maus oder Finger dreht und neigt die Ansicht. Die Drehung ist auf 75° nach links und rechts begrenzt.
- Mausrad oder zwei Finger ändern den Zoom.
- „Ansicht zurücksetzen“ stellt die Ausgangsansicht wieder her.
- Bei fokussierter Szene funktionieren auch Pfeiltasten, +/− und R.

## Bereitstellen

Die Dateien im Hauptverzeichnis des Repositories belassen. Für GitHub Pages unter **Settings → Pages** die Veröffentlichung aus dem gewünschten Branch und dem Ordner **/ (root)** aktivieren.

Kamerazugriff benötigt HTTPS oder localhost. Die Bibliotheken werden von externen CDNs geladen; dafür ist eine Internetverbindung erforderlich.

Für eine lokale Vorschau bei installiertem Python im Projektordner ausführen:

```sh
python -m http.server 8080
```

Anschließend [localhost:8080/?preview=1](http://localhost:8080/?preview=1) öffnen. Eine unverschlüsselte LAN-Adresse genügt für den Kamerazugriff auf dem Smartphone nicht.

## Projektstruktur

| Datei / Ordner | Inhalt |
| --- | --- |
| `index.html`, `style.css` | Startansicht und Gestaltung |
| `js/app.js` | Kamerastart, Status und Wechsel zur Vorschau |
| `js/scene.js` | Szenenaufbau und Animationen |
| `js/config.js` | Positionen, Größen, Animationen und Tracking-Einstellungen |
| `js/preview.js` | Steuerung der Vorschau |
| `js/assets.json` | Texturpfade, Abmessungen und Ausschnitte |
| `assets/` | Originalgrafiken |
| `assets/optimized/` | Für die Webseite aufbereitete Grafiken |
| `targets.mind` | Erkennungsdaten für die gedruckte Karte |
| `tools/` | Aufbereitung der Grafiken und automatisierte Tests |

## Anpassen

Texte stehen in `index.html` und `js/app.js`. Die Szene wird über `js/config.js` angepasst. Eine Einheit entspricht der Kartenbreite; Positionen innerhalb der Szene sind als `[rechts, höhe, tiefe]` angegeben. Positive Tiefe zeigt zum vorderen Kartenrand.

`tools/prepare_assets.py` erzeugt die optimierten Grafiken und benötigt Python mit Pillow. Für den Betrieb der Webseite werden diese Werkzeuge nicht benötigt.

## Tracking

Die Bildvorlage für `targets.mind` muss zur gedruckten Karte passen. Zum Erstellen die unverzerrte Druckvorlage im [MindAR-Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/) verwenden.

Auf iPhone/Safari wurde Zittern der gesamten Szene beobachtet. Die aktuelle Glättung verwendet `filterMinCF: 0.0003` und `filterBeta: 0.01`. Die Verbesserung ist auf dem Gerät noch nicht bestätigt. Stärkere Glättung kann Bewegungen verzögert darstellen.

Gute Beleuchtung, eine ebene Karte und ein Blick von schräg oben erleichtern die Erkennung. Sehr flache Blickwinkel oder Reflexionen können weiterhin zu Zittern und Trackingverlust führen.

## Prüfen

Die automatisierten Tests benötigen Node.js:

```sh
node tools/test-scene.cjs
node tools/test-preview.cjs
```

Sie prüfen Szenenaufbau, Animationen und Vorschau-Steuerung mit vereinfachten Testadaptern. Darstellung und Tracking müssen zusätzlich im Browser mit der gedruckten Karte geprüft werden, einschließlich Kamerafreigabe, Wiedererkennung und Rückkehr aus dem Hintergrund.

## Dokumentation

- [A-Frame 1.5.0](https://aframe.io/docs/1.5.0/)
- [MindAR](https://hiukim.github.io/mind-ar-js-doc/)
- [MindAR-Tracking-Einstellungen](https://hiukim.github.io/mind-ar-js-doc/quick-start/tracking-config/)
