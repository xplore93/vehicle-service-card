# Vehicle Service Card

Lovelace Dashboard Cards für den [Vehicle Service Manager](https://github.com/toxictody1337/vehicle-service-manager).

Zwei Cards in einem:
- **`vehicle-service-card`** – vollständiges Dashboard mit Service-Status, Historie, Reparaturen und Reifentracking
- **`vehicle-service-compact-card`** – kompakte Icon-Leiste mit Farbampel (grün/gelb/rot)

## Voraussetzung

Die [Vehicle Service Manager Integration](https://github.com/toxictody1337/vehicle-service-manager) muss installiert sein.

## Installation via HACS

1. HACS → Frontend → drei Punkte → **Custom repositories**
2. URL: `https://github.com/toxictody1337/vehicle-service-card`
3. Kategorie: **Lovelace** → Add
4. Installieren → Browser neu laden

## Verwendung

### Vollständige Dashboard-Card
```yaml
type: custom:vehicle-service-card
```

### Kompakte Icon-Card
```yaml
type: custom:vehicle-service-compact-card
```

Beide Cards können über **Dashboard bearbeiten → + Karte hinzufügen → "Vehicle Service"** aus dem UI-Picker hinzugefügt werden.

> **Hinweis nach Erstinstallation:** Nach der Installation über HACS muss die Karte einmalig manuell hinzugefügt werden, damit sie im Picker erscheint:
> 1. Dashboard → Bearbeiten → `+` → **Manuell**
> 2. Eingeben: `type: custom:vehicle-service-card`
> 3. Speichern → Browser neu laden (`F5`)
> 
> Ab dann erscheinen beide Cards dauerhaft im Picker unter "Vehicle Service".

## Features

### vehicle-service-card
- Service-Status mit 3-Farb-Ampel (grün / gelb / rot)
- 11 Service-Punkte: Ölwechsel, Inspektion, Bremsflüssigkeit, Filter, Zündkerzen, HU/AU u.v.m.
- Fortschrittsbalken mit Fälligkeitsanzeige (km + Monate)
- Service-Historie mit Bearbeiten und Löschen
- Reparaturen & Verschleiß dokumentieren
- Reifentracking mit Profiltiefe und Verschleißprojektion
- Mehrere Fahrzeuge mit Tab-Auswahl
- KM-Stand direkt aus der Card aktualisieren
- Marken-Avatar mit Herstellerfarbe

### vehicle-service-compact-card
- Farbige Icon-Quadrate für jeden Service-Punkt
- Grün = OK · Gelb = bald fällig · Rot = fällig/überfällig
- Reifenstatus als zusätzliches Icon
- Tooltip mit Service-Bezeichnung beim Hovern
- Kompakt – ideal für Übersichts-Dashboards

## Farbsystem

| Farbe | Bedeutung |
|-------|-----------|
| 🟢 Grün | Alles OK |
| 🟡 Gelb | ≥70% verbraucht oder ≤3.000 km / ≤3 Monate |
| 🔴 Rot | ≥90% verbraucht oder ≤1.000 km / ≤1 Monat |

## Icons

Alle Icons aus dem [Material Design Icons](https://materialdesignicons.com) Set (MDI) – keine externen Abhängigkeiten.

---

*Entwickelt mit Unterstützung von Claude (Anthropic AI)*  
MIT License © 2026 toxictody1337
