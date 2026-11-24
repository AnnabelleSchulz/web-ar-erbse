# pea-web-ar

Die Webseite erkennt die gedruckte Karte und zeigt darauf eine animierte Szene. Eine Vorschau ohne Kamera ist ebenfalls verfügbar.

Statische Webseite mit A-Frame 1.5.0 und MindAR 1.2.5. Kein Backend und kein Build-Schritt.

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
