# Vehicle Service Card

Lovelace Dashboard Cards für den [Vehicle Service Manager](https://github.com/toxictody1337/vehicle-service-manager).

## Voraussetzung

Die [Vehicle Service Manager Integration](https://github.com/toxictody1337/vehicle-service-manager) muss installiert sein.

## Installation via HACS

1. HACS → Frontend → drei Punkte → **Custom repositories**
2. URL: `https://github.com/toxictody1337/vehicle-service-card`
3. Kategorie: **Dashboard** → Add → Installieren
4. **HA neu starten**
5. Browser neu laden (`Strg+Shift+R`)

## Karte hinzufügen

> ⚠️ Diese Card nutzt eine WebSocket-Verbindung zur Integration und erscheint deshalb **nicht im visuellen Card-Picker**. Sie muss einmalig manuell per YAML hinzugefügt werden.

### Schritt-für-Schritt

1. Dashboard öffnen → oben rechts **Bearbeiten** (Stift-Icon)
2. **+ Karte hinzufügen** → ganz unten **"Manuell"** klicken
3. YAML eingeben und **Speichern**

### Vollständige Dashboard-Card
```yaml
type: custom:vehicle-service-card
```

### Kompakte Icon-Card (für Übersichts-Dashboards)
```yaml
type: custom:vehicle-service-compact-card
```

---

## Features

### vehicle-service-card (Vollversion)
- Service-Status mit 3-Farb-Ampel (🟢 OK / 🟡 bald fällig / 🔴 fällig)
- 11 Service-Punkte: Ölwechsel, Inspektion, Bremsflüssigkeit, Filter, Zündkerzen, HU/AU u.v.m.
- Fortschrittsbalken mit km- und Monats-Fälligkeit
- Service-Historie mit Bearbeiten und Löschen
- Reparaturen & Verschleiß dokumentieren
- Reifentracking mit Profiltiefe und Verschleißprojektion
- Mehrere Fahrzeuge mit Tab-Auswahl
- KM-Stand direkt aus der Card aktualisieren
- Marken-Avatar mit Herstellerfarbe

### vehicle-service-compact-card (Kompaktversion)
- Farbige Icon-Quadrate für jeden Service-Punkt
- 🟢 OK · 🟡 bald fällig · 🔴 fällig/überfällig
- Reifenstatus als zusätzliches Icon
- Tooltip beim Hovern zeigt den Service-Namen

## Farbsystem

| Farbe | Bedeutung |
|-------|-----------|
| 🟢 Grün | Alles OK |
| 🟡 Gelb | ≥70% verbraucht oder ≤3.000 km / ≤3 Monate |
| 🔴 Rot | ≥90% verbraucht oder ≤1.000 km / ≤1 Monat |

---

*Entwickelt mit Unterstützung von Claude (Anthropic AI)*  
MIT License © 2026 toxictody1337
