/**
 * FS MASTER UNIFIED ENGINE v2.22 - THE 97% SOLUTION
 * MANDATE: Full Detail | Zero Snippets | Zero-Fake Policy [cite: 2026-01-26]
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";
const GPORTAL_FEED = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";
const getTruth = () => `?truth=${Date.now()}`;

// THE DICTIONARY [cite: 2026-02-13]
const TRANSLATION = {
    "ZATS3200.XML": "ZTS Slurry Tanker", "SERIES9RX.XML": "JD 9RX", "SERIES8.XML": "JD 8R",
    "CP690.XML": "JD CP690 Cotton Picker", "KDD941STH.XML": "Kuhn Mower", "WATER": "Water"
};

document.addEventListener('DOMContentLoaded', async () => {
    const selector = document.getElementById('slotSelector');
    const liveMap = await fetchGPortalMap();

    for (let i = 1; i <= 20; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.innerText = `SAVE SLOT ${i} ${i === 2 ? '(TEXAS)' : i === 5 ? '(MISSOURI)' : ''} ${getSlotFromMap(liveMap) === i ? '[LIVE]' : ''}`;
        selector.appendChild(opt);
    }

    selector.value = getSlotFromMap(liveMap) || 2;
    runMasterDrill(selector.value);
    selector.addEventListener('change', (e) => runMasterDrill(e.target.value));
    setInterval(() => runMasterDrill(selector.value), 30000);
});

async function runMasterDrill(slot) {
    const path = `${GITHUB_ROOT}/saved-game-${slot}`;
    document.getElementById('slotTitle').innerText = `FULL-SPECTRUM DRILL: SLOT ${slot}`;

    const [fml, pre, fld, mis, vml, iml] = await Promise.all([
        fetchXML(`${path}/farmland.xml`), fetchXML(`${path}/precisionFarming.xml`),
        fetchXML(`${path}/fields.xml`), fetchXML(`${path}/missions.xml`),
        fetchXML(`${path}/vehicles.xml`), fetchXML(`${path}/items.xml`)
    ]);

    if (fml) renderFields(fml, pre, fld);
    if (mis) renderContracts(mis);
    if (vml) renderAssets(vml, iml);
}

/** 1. THE 97% FIELD DRILL [cite: 2026-02-13] */
function renderFields(fml, pre, fld) {
    const owned = Array.from(fml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") !== "0");
    const pNodes = Array.from(pre?.getElementsByTagName("field") || []);
    const fNodes = Array.from(fld?.getElementsByTagName("field") || []);

    document.querySelector('#box-farmland .content').innerHTML = owned.map(land => {
        const id = land.getAttribute("id");
        const p = pNodes.find(n => n.getAttribute("id") === id);
        const f = fNodes.find(n => n.getAttribute("id") === id);
        const ownerClass = land.getAttribute("farmId") === "1" ? "owner-kevin" : "owner-ray";

        return `
            <div class="data-row ${ownerClass}">
                <strong style="color:var(--kevin-orange)">FIELD ${id}</strong> | ${f?.getAttribute("fruitType") || "STUBBLE"}
                <div style="font-size:10px; display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:8px;">
                    <span>pH: ${parseFloat(p?.getAttribute("phValue") || 0).toFixed(1)}</span>
                    <span>NITROGEN: ${parseFloat(p?.getAttribute("nitrogenValue") || 0).toFixed(0)}kg</span>
                    <span>LIME: ${p?.getAttribute("needsLime") === "true" ? '⚠️ NEEDED' : 'OK'}</span>
                    <span>PLOW: ${p?.getAttribute("needsPlowing") === "true" ? '⚠️ NEEDED' : 'OK'}</span>
                    <span>WEEDS: ${f?.getAttribute("weedState") || 'NONE'}</span>
                    <span>GROWTH: ${f?.getAttribute("growthState") || 'N/A'}</span>
                </div>
            </div>`;
    }).join('');
}

/** 2. THE 97% CONTRACT DRILL [cite: 2026-02-13] */
function renderContracts(xml) {
    const active = Array.from(xml.getElementsByTagName("mission")).filter(m => m.getAttribute("status") === "1");
    document.querySelector('#box-missions .content').innerHTML = active.map(m => {
        const farmId = m.getAttribute("farmId");
        const colorClass = farmId === "1" ? "owner-kevin" : "owner-ray";
        const label = farmId === "1" ? "var(--kevin-orange)" : "var(--ray-red)";
        
        return `
            <div class="data-row ${colorClass}">
                <strong style="color:${label}">${m.getAttribute("type").toUpperCase()}</strong>
                <div style="font-size:11px; margin-top:5px;">FLD ${m.getAttribute("fieldId")} | $${parseFloat(m.getAttribute("reward")).toLocaleString()}</div>
                <div style="font-size:9px; opacity:0.6;">DELIVER TO: ${m.getAttribute("sellPoint") || "N/A"}</div>
                <div style="font-size:9px; color:#00ffcc;">PROGRESS: ${parseFloat(m.getAttribute("depositedLiters") || 0).toLocaleString()}L / ${parseFloat(m.getAttribute("expectedLiters") || 0).toLocaleString()}L</div>
            </div>`;
    }).join('') || "NO ACTIVE CONTRACTS";
}

/** 3. THE 97% FLEET & ASSET DRILL [cite: 2026-02-13] */
function renderAssets(vml, iml) {
    const units = Array.from(vml.getElementsByTagName("vehicle")).filter(u => !u.getAttribute("filename").toUpperCase().includes('BALE'));
    const items = Array.from(iml?.getElementsByTagName("placeable") || []);

    const unitHtml = units.map(u => {
        const farmId = u.getAttribute("farmId") || "1";
        const colorClass = farmId === "1" ? "owner-kevin" : "owner-ray";
        const rawFile = u.getAttribute("filename")?.split('/').pop().toUpperCase();
        const cleanName = TRANSLATION[rawFile] || rawFile.replace('.XML', '');
        const wear = (parseFloat(u.getElementsByTagName("wearable")[0]?.getAttribute("damage") || 0) * 100).toFixed(0);
        const fuel = u.getElementsByTagName("fillUnit")[0]?.getAttribute("fillLevel") || 0;

        return `
            <div class="data-row ${colorClass}">
                <strong style="color:${farmId === "1" ? 'var(--kevin-orange)' : 'var(--ray-red)'}">${cleanName}</strong>
                <div style="font-size:10px; margin-top:5px;">FUEL: ${parseFloat(fuel).toFixed(0)}L | DAMAGE: ${wear}%</div>
            </div>`;
    }).join('');

    const itemHtml = items.map(i => {
        const fill = i.getElementsByTagName("fillLevel")[0];
        const name = i.getAttribute("filename")?.split('/').pop().toUpperCase().replace('.XML', '');
        if (name.includes("GREENHOUSE")) {
            const water = parseFloat(fill?.textContent || 0);
            return `<div class="data-row" style="border-left:5px solid #00d4ff; padding-left:15px;">
                <strong>GREENHOUSE: ${name}</strong>
                <div style="font-size:10px; color:${water < 500 ? 'var(--danger)' : '#fff'}">WATER: ${water.toFixed(0)}L ${water < 500 ? '(⚠️ REFILL)' : ''}</div>
            </div>`;
        }
        return '';
    }).join('');

    document.querySelector('#box-fleet .content').innerHTML = unitHtml + itemHtml || "NO ASSETS";
}

async function fetchGPortalMap() { try { const res = await fetch(GPORTAL_FEED + getTruth()); const xml = new DOMParser().parseFromString(await res.text(), "text/xml"); return xml.getElementsByTagName("Server")[0]?.getAttribute("mapName") || ""; } catch (e) { return ""; } }
function getSlotFromMap(map) { return map.includes("Texas") ? 2 : map.includes("Missouri") ? 5 : null; }
async function fetchXML(url) { try { const res = await fetch(url + getTruth()); return res.ok ? new DOMParser().parseFromString(await res.text(), "text/xml") : null; } catch (e) { return null; } }
