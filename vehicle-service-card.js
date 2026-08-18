/**
 * Vehicle Service Manager - Lovelace Cards v1.6.2
 * Includes: vehicle-service-card + vehicle-service-compact-card
 */

// ── LitElement / Base Resolution ──────────────────────────────────────────────
const _LitElement = () => {
  const el =
    customElements.get("ha-panel-lovelace") ||
    customElements.get("hui-view") ||
    customElements.get("home-assistant");
  return el ? Object.getPrototypeOf(Object.getPrototypeOf(el.prototype)).constructor : HTMLElement;
};

const DOMAIN = "vehicle_service";

// ── Brand Helpers & Theme Colors ──────────────────────────────────────────────
const BRAND_COLORS = {
  volkswagen: "#00519F", vw: "#00519F", skoda: "#4BA82E", audi: "#BB0A30", bmw: "#1C69D4",
  mercedes: "#9E9E9E", "mercedes-benz": "#9E9E9E", mini: "#000000", porsche: "#AE0521",
  opel: "#FFED00", ford: "#003476", seat: "#E2001A", cupra: "#1B1B1B", renault: "#FFCC00",
  peugeot: "#003189", fiat: "#9B0000", toyota: "#EB0A1E", honda: "#CC0000", mazda: "#910E10",
  nissan: "#C3002F", hyundai: "#002C5F", kia: "#05141F", volvo: "#003057", tesla: "#CC0000",
  dacia: "#005BBB", citroen: "#9E1B32",
};

function brandColor(make) {
  return make ? BRAND_COLORS[make.toLowerCase().trim()] || "#1976D2" : "#1976D2";
}

function makeInitials(make) {
  if (!make) return "?";
  const words = make.trim().split(/\s+/);
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : make.slice(0, 2).toUpperCase();
}

function logoHtml(make, size = 20) {
  const color = brandColor(make);
  const initials = makeInitials(make);
  const fontSize = size <= 16 ? Math.round(size * 0.5) : Math.round(size * 0.42);
  const borderRadius = size <= 20 ? "50%" : "8px";

  return `<div style="
    width: ${size}px;
    height: ${size}px;
    border-radius: ${borderRadius};
    background: ${color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${fontSize}px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    letter-spacing: -0.5px;
  ">${initials}</div>`;
}

// ── i18n & Localization ────────────────────────────────────────────────────────
const I18N = {
  de: {
    subtitle: "Service-Status, Reparaturen und Reifentracking",
    errorPrefix: "Fehler: ",
    noVehicles: "Keine Fahrzeuge.",
    ok: "OK",
    tabTires: "Reifen",
  },
  en: {
    subtitle: "Service status, repairs and tire tracking",
    errorPrefix: "Error: ",
    noVehicles: "No vehicles.",
    ok: "OK",
    tabTires: "Tires",
  },
};

function _lang(hass) {
  return (((hass && hass.language) || navigator.language || "en") + "")
    .toLowerCase()
    .slice(0, 2) || "en";
}

function t(hass, key) {
  const lang = _lang(hass);
  const dict = I18N[lang];
  return dict && dict[key] != null
    ? dict[key]
    : I18N.en[key] != null
    ? I18N.en[key]
    : I18N.de[key] != null
    ? I18N.de[key]
    : key;
}

function _loc(hass) {
  return (hass && hass.language) || navigator.language || "en";
}

const SVC_LABELS = {
  de: { oil: "Ölwechsel", inspection: "Inspektion", brake_fluid: "Bremsflüssigkeit", cabin_filter: "Innenraumfilter", air_filter: "Luftfilter", spark_plugs: "Zündkerzen", fuel_filter: "Kraftstofffilter", gearbox: "Getriebeöl", haldex: "Haldex-Öl", ac: "Klimawartung", hu: "Hauptuntersuchung (HU/AU)" },
  en: { oil: "Oil change", inspection: "Inspection", brake_fluid: "Brake fluid", cabin_filter: "Cabin filter", air_filter: "Air filter", spark_plugs: "Spark plugs", fuel_filter: "Fuel filter", gearbox: "Gearbox oil", haldex: "Haldex oil", ac: "A/C service", hu: "MOT (HU/AU)" },
};

function svcLabel(hass, sid) {
  const labels = SVC_LABELS[_lang(hass)] || SVC_LABELS.de;
  return labels[sid] || sid;
}

const SVC_ICONS = {
  oil: "mdi:oil", inspection: "mdi:clipboard-check-outline", brake_fluid: "mdi:car-brake-alert",
  cabin_filter: "mdi:fan", air_filter: "mdi:air-filter", spark_plugs: "mdi:lightning-bolt",
  fuel_filter: "mdi:gas-station", gearbox: "mdi:cog-transfer", haldex: "mdi:car-4wd",
  ac: "mdi:air-conditioner", hu: "mdi:car-search",
};

const REP_LABELS = {
  brakes_front: "Bremse vorne", brakes_rear: "Bremse hinten", brakes_full: "Bremsen komplett",
  discs_front: "Bremsscheiben vorne", discs_rear: "Bremsscheiben hinten", shock_front: "Stoßdämpfer vorne",
  shock_rear: "Stoßdämpfer hinten", timing_belt: "Zahnriemen", battery: "Batterie", clutch: "Kupplung", other: "Sonstiges",
};

const TIRE_WARN = { summer: 3.0, winter: 4.0, allseason: 4.0 };
const TIRE_MIN = 1.6;
const WEAR = 1.5 / 10000;

function calcPct(vehicle, sid) {
  const last = (vehicle.lastService || {})[sid] || {};
  const intv = (vehicle.intervals || {})[sid] || {};
  const ez = vehicle.ezDate;
  const curKm = vehicle.km || 0;

  let kp = null, kl = null, tp = null, ml = null;

  if (intv.km) {
    const base = last.km != null ? last.km : 0;
    const driven = curKm - base;
    kp = Math.min(100, Math.round((driven / intv.km) * 100));
    kl = Math.max(0, intv.km - driven);
  }

  if (intv.months) {
    const baseDate = last.date || ez || null;
    if (baseDate) {
      const ms = (Date.now() - new Date(baseDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      tp = Math.min(100, Math.round((ms / intv.months) * 100));
      ml = Math.max(0, Math.round(intv.months - ms));
    } else {
      tp = 0;
      ml = intv.months;
    }
  }

  const pct = Math.max(kp ?? 0, tp ?? 0);
  const isRed = pct >= 90 || (kl !== null && kl <= 1000) || (ml !== null && ml <= 1);
  const isYellow = !isRed && (pct >= 70 || (kl !== null && kl <= 3000) || (ml !== null && ml <= 3));

  return { pct, kp, tp, kl, ml, tier: isRed ? "red" : isYellow ? "yellow" : "green" };
}

const TIER_COL = { green: "#3B6D11", yellow: "#BA7517", red: "#A32D2D" };
const TIER_BG = { green: "#EAF3DE", yellow: "#FAEEDA", red: "#FCEBEB" };

function fd(iso, hass) {
  return iso ? new Date(iso).toLocaleDateString(_loc(hass)) : "—";
}

function fkm(km, hass) {
  return km != null ? Number(km).toLocaleString(_loc(hass)) + " km" : "—";
}

function today() {
  return new Date().toISOString().split("T")[0];
}

const WIDTHS = [135, 145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315, 325, 335];
const RATIOS = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
const RIMS = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const PROF_STEPS = Array.from({ length: 25 }, (_, i) => parseFloat((i * 0.5).toFixed(1)));

function sel(id, opts, val = "") {
  return `<select id="${id}">${opts.map((o) => `<option value="${o.v || o}" ${(o.v || o) == val ? "selected" : ""}>${o.l || o}</option>`).join("")}</select>`;
}

function inp(id, type, ph, val = "", extra = "") {
  return `<input id="${id}" type="${type}" placeholder="${ph}" value="${val}" ${extra}/>`;
}

// ── Standard Card Base Implementation ──────────────────────────────────────────
class VehicleServiceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
  }
  setConfig(c) { this._config = c; }
  set hass(h) { this._hass = h; }
}

// ── Compact Card ───────────────────────────────────────────────────────────────
class VehicleServiceCompactCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._vehicles = [];
    this._vehicleIds = [];
    this._cur = 0;
    this._loading = true;
    this._err = null;
    this._lang = "";
  }

  setConfig(c) { this._config = c; }

  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (first) {
      if (h) this._load();
    } else if (h && this._vehicles.length && this._lang !== _lang(h)) {
      this._lang = _lang(h);
      this._paint();
    }
  }

  static getStubConfig() { return {}; }
  static getConfigElement() { return document.createElement("vehicle-service-compact-card-editor"); }
  getCardSize() { return 3; }

  async _load() {
    this._loading = true;
    this._paint();
    try {
      const res = await this._hass.callWS({ type: `${DOMAIN}/vehicles` });
      const entries = Object.entries(res.vehicles || {});
      this._vehicleIds = entries.map(([id]) => id);
      this._vehicles = entries.map(([, v]) => v);
      this._loading = false;
    } catch (e) {
      this._err = `${e.message || e}`;
      this._loading = false;
    }
    this._paint();
  }

  _v() { return this._vehicles[this._cur]; }

  _placeholder() {
    return `
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:500;margin-bottom:8px">Vehicle Service Manager</div>
        <div style="font-size:11px;color:#888;margin-bottom:10px">${t(this._hass, "subtitle")}</div>
        <div style="display:flex;gap:6px">
          ${["mdi:oil", "mdi:clipboard-check-outline", "mdi:car-brake-alert", "mdi:fan"].map((i) => `
            <div style="background:#EAF3DE;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
              <ha-icon icon="${i}" style="color:#3B6D11;--mdc-icon-size:20px"></ha-icon>
            </div>`).join("")}
        </div>
      </div>`;
  }

  _paint() {
    let body = "";
    if (!this._hass) body = this._placeholder();
    else if (this._loading) body = `<div class="loading"><div class="spin"></div></div>`;
    else if (this._err) body = `<div style="padding:8px;color:#f44;font-size:11px">${t(this._hass, "errorPrefix")}${this._err}</div>`;
    else if (!this._vehicles.length) body = `<div style="padding:8px;font-size:11px;color:var(--secondary-text-color)">${t(this._hass, "noVehicles").replace(/\.$/, "")}</div>`;
    else body = this._main();

    this.shadowRoot.innerHTML = `<style>${this._css()}</style><ha-card><div class="w">${body}</div></ha-card>`;
    this.shadowRoot.querySelectorAll(".cpill").forEach((b) =>
      b.addEventListener("click", () => {
        this._cur = parseInt(b.dataset.ci, 10);
        this._paint();
      })
    );
  }

  _main() {
    const h = this._hass;
    const v = this._v();

    const pills = this._vehicles.length > 1
      ? `<div class="cpills">${this._vehicles.map((vv, i) => `<button class="cpill${i === this._cur ? " on" : ""}" data-ci="${i}">${logoHtml(vv.make || "", 14)}</button>`).join("")}</div>`
      : "";

    const icons = (v.services || []).map((sid) => {
      const r = calcPct(v, sid);
      const col = TIER_COL[r.tier];
      const bg = TIER_BG[r.tier];
      return `<div class="iico" style="background:${bg};color:${col}" title="${svcLabel(h, sid)}"><ha-icon icon="${SVC_ICONS[sid] || "mdi:wrench"}"></ha-icon></div>`;
    }).join("");

    let tireIco = "";
    const tires = v.tires || [];
    if (tires.length) {
      const lat = tires[tires.length - 1];
      const tt = lat.type || "summer";
      const wm = TIRE_WARN[tt] || 3;
      const mKm = parseInt(lat.km, 10) || 0;
      let worst = 999;

      ["vl", "vr", "hl", "hr"].forEach((pos) => {
        const orig = parseFloat(lat[pos]) || 0;
        if (orig) {
          const worn = Math.max(0, orig - Math.max(0, (v.km || 0) - mKm) * WEAR);
          if (worn < worst) worst = worn;
        }
      });

      const col = worst <= TIRE_MIN ? "#A32D2D" : worst <= wm ? "#BA7517" : "#3B6D11";
      const bg = worst <= TIRE_MIN ? "#FCEBEB" : worst <= wm ? "#FAEEDA" : "#EAF3DE";
      tireIco = `<div class="iico" style="background:${bg};color:${col}" title="${t(h, "tabTires")}"><ha-icon icon="mdi:car-tire-alert"></ha-icon></div>`;
    }

    return `${pills}<div class="chdr">${logoHtml(v.make || "", 28)}<div class="chdr-text"><div class="cvtit">${v.make || ""} ${v.model || ""}</div><div class="cvkm">${fkm(v.km, h)}</div></div></div><div class="igrid">${icons}${tireIco}</div>`;
  }

  _css() {
    return `
      ha-card { background: var(--card-background-color, #1c1c1e); border-radius: 12px; }
      .w { padding: 10px 12px 12px; font-family: var(--primary-font-family, sans-serif); color: var(--primary-text-color); }
      .loading { display: flex; align-items: center; justify-content: center; padding: 12px; }
      .spin { width: 16px; height: 16px; border: 2px solid var(--divider-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin .8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .cpills { display: flex; gap: 4px; margin-bottom: 8px; }
      .cpill { padding: 2px 6px; border: 1px solid var(--divider-color); border-radius: 12px; cursor: pointer; background: none; display: flex; align-items: center; gap: 3px; }
      .cpill.on { background: var(--primary-color); border-color: var(--primary-color); }
      .chdr { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
      .chdr-text { flex: 1; min-width: 0; }
      .cvtit { font-size: 13px; font-weight: 500; }
      .cvkm { font-size: 11px; color: var(--secondary-text-color); }
      .igrid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
      .iico { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; --mdc-icon-size: 22px; flex-shrink: 0; cursor: default; }
    `;
  }
}

// ── Editor Stubs ───────────────────────────────────────────────────────────────
class VehicleServiceCardEditor extends HTMLElement { setConfig(c) { this._config = c; } }
class VehicleServiceCompactCardEditor extends HTMLElement { setConfig(c) { this._config = c; } }

// ── Registration ──────────────────────────────────────────────────────────────
if (!customElements.get("vehicle-service-card")) {
  customElements.define("vehicle-service-card", VehicleServiceCard);
}
if (!customElements.get("vehicle-service-compact-card")) {
  customElements.define("vehicle-service-compact-card", VehicleServiceCompactCard);
}
if (!customElements.get("vehicle-service-card-editor")) {
  customElements.define("vehicle-service-card-editor", VehicleServiceCardEditor);
}
if (!customElements.get("vehicle-service-compact-card-editor")) {
  customElements.define("vehicle-service-compact-card-editor", VehicleServiceCompactCardEditor);
}

console.info("%c VEHICLE-SERVICE-CARD %c v1.6.2 ", "background:#1976D2;color:#fff;font-weight:bold", "background:#4CAF50;color:#fff");

window.customCards = window.customCards || [];
window.customCards = window.customCards.filter(
  (c) => c.type !== "vehicle-service-card" && c.type !== "vehicle-service-compact-card"
);
window.customCards.push(
  { type: "vehicle-service-card", name: "Vehicle Service Manager", description: t(null, "subtitle"), preview: true, documentationURL: "https://github.com/toxictody1337/vehicle-service-card" },
  { type: "vehicle-service-compact-card", name: "Vehicle Service Manager – Compact", description: t(null, "subtitle"), preview: true, documentationURL: "https://github.com/toxictody1337/vehicle-service-card" }
);

function _vsmFire() {
  window.dispatchEvent(new CustomEvent("ll-custom-cards-updated"));
}

function _vsmPatchPicker(picker) {
  if (!picker || picker._vsm_patched) return;
  picker._vsm_patched = true;
  if (picker._filterCards) {
    const orig = picker._filterCards.bind(picker);
    picker._filterCards = function (cards) {
      const vsm = (window.customCards || []).filter(
        (c) => c.type === "vehicle-service-card" || c.type === "vehicle-service-compact-card"
      );
      return orig([...vsm, ...(cards || [])]);
    };
  }
  if (picker.requestUpdate) picker.requestUpdate();
}

const _vsmObs = new MutationObserver((mutations) => {
  mutations.forEach((m) =>
    m.addedNodes.forEach((node) => {
      if (!node.querySelectorAll) return;
      const pickers = node.tagName === "hui-card-picker"
        ? [node]
        : Array.from(node.querySelectorAll("hui-card-picker"));
      pickers.forEach(_vsmPatchPicker);
    })
  );
});

_vsmObs.observe(document.documentElement, { childList: true, subtree: true });

customElements.whenDefined("hui-card-picker").then(() => {
  _vsmFire();
  document.querySelectorAll("hui-card-picker").forEach(_vsmPatchPicker);
});

setTimeout(_vsmFire, 500);
setTimeout(_vsmFire, 2000);
