# Vehicle Service Card

Lovelace Dashboard Cards for the [Vehicle Service Manager](https://github.com/toxictody1337/vehicle-service-manager).

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.de.md">Deutsch</a>
</p>

---

## Prerequisites

The [Vehicle Service Manager integration](https://github.com/toxictody1337/vehicle-service-manager) must be installed.

## Installation via HACS

1. HACS → Frontend → three dots → **Custom repositories**
2. URL: `https://github.com/toxictody1337/vehicle-service-card`
3. Category: **Dashboard** → Add → Install
4. **Restart HA**
5. Reload the browser (`Ctrl+Shift+R`)

## Adding the card

> ⚠️ This card uses a WebSocket connection to the integration and therefore **does not appear in the visual card picker**. It must be added manually via YAML once.

### Step by step

1. Open a dashboard → top right **Edit** (pencil icon)
2. **+ Add card** → click **"Manually"** at the bottom
3. Enter the YAML and **Save**

### Full dashboard card
```yaml
type: custom:vehicle-service-card
```

### Compact icon card (for overview dashboards)
```yaml
type: custom:vehicle-service-compact-card
```

---

## Features

### vehicle-service-card (full version)
- Service status with 3-color traffic light (🟢 OK / 🟡 due soon / 🔴 due)
- 11 service points: oil change, inspection, brake fluid, filters, spark plugs, HU/AU, and more
- Progress bars with km- and month-based due dates
- Service history with edit and delete
- Document repairs & wear
- Tire tracking with tread depth and wear projection
- Multiple vehicles with tab selection
- Update mileage directly from the card
- Brand avatar with manufacturer color

### vehicle-service-compact-card (compact version)
- Colored icon squares for each service point
- 🟢 OK · 🟡 due soon · 🔴 due/overdue
- Tire status as an additional icon
- Hover tooltip shows the service name

## Color system

| Color | Meaning |
|-------|---------|
| 🟢 Green | All OK |
| 🟡 Yellow | ≥70% used or ≤3,000 km / ≤3 months |
| 🔴 Red | ≥90% used or ≤1,000 km / ≤1 month |

---

*Developed with the support of Claude (Anthropic AI)*  
MIT License © 2026 toxictody1337
