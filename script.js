/**
 * FS MASTER UNIFIED ENGINE v2.04 - FULL SPECTRUM SCROLL MATRIX
 * REPAIR: Groups Bales, enables Independent Scroll Zones, drills all Key XMLs.
 * MANDATE: Full Detail | Zero Snippets | Zero-Fake Policy [cite: 2026-01-26]
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";
const GPORTAL_FEED = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";
const getTruthID = () => `?truth=${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('saveSelector');
    masterSyncCycle(selector.value);
    selector.addEventListener('change', (e) => masterSyncCycle(e.target.value));
    setInterval(() => masterSyncCycle(selector.value), 30000);
});

async function masterSyncCycle(slot) {
    const gitPath = `${GITHUB_ROOT}/saved-game-${slot}`;
    document.getElementById('currentSlotLabel').textContent = `AUTO-SYNC SLOT ${slot}`;
    
    await Promise.all([
        fetchLiveGPortal(GPORTAL_FEED),
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetDetailed),
        fetchDeepXML(`${gitPath}/farms.xml`, parseFinancials),
        fetchDeepXML(`${gitPath}/missions.xml`, parseMissionsDetailed),
        injectBladeModule('module-1-field-info', 'field-info.html', `${gitPath}/farmland.xml`, 
            (xml) => parsePrecisionDetailed(xml, `${gitPath}/precisionFarming.xml`, `${gitPath}/fields.xml`)),
        injectBladeModule('module-2-animal-info', 'animal-info.html', `${gitPath}/placeables.xml`, parseAnimalDetailed),
        injectBladeModule('module-3-factory-info', 'factory-info.html', `${gitPath}/items.xml`, parseItemsDetailed)
    ]);
}

/**
 * FLEET: BALE DE-CLUTTER & DETAILED EXTRACTION [cite: 2026-02-13]
 */
function parseFleetDetailed(xml) {
    const units = Array.from(xml.getElementsByTagName("vehicle"));
    const machinery = units.filter(u => !u.getAttribute("filename").toUpperCase().includes('BALE'));
    const baleCount = units.length - machinery.length;

    let html = machinery.map(u => {
        const name = u.getAttribute("filename")?.split('/').pop().toUpperCase().replace(/_/g, ' ') || "UNIT";
        const wear = (parseFloat(u.getElementsByTagName("wearable")[0]?.getAttribute("damage") || 0) * 100).toFixed(0);
        const fills = Array.from(u.getElementsByTagName("fillUnit")).filter(f => parseFloat(f.getAttribute("fillLevel")) > 0);

        return `
            <div class="telemetry-row" style="display:grid; grid-template-columns: 1.5fr 2fr 1fr; gap:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding:8px 0;">
                <span style="font-weight:900; font-size:11px;">${name}</span>
                <div style="font-size:10px; opacity:0.8;">
                    ${fills.map(f => `<div>${f.getAttribute("fillType")}: ${parseFloat(f.getAttribute("fillLevel")).toFixed(0)}L</div>`).join('') || "NO CARGO"}
                </div>
                <div style="text-align:right; font-size:9px; opacity:0.6;">DMG: ${wear}%</div>
            </div>`;
    }).join('');

    if (baleCount > 0) {
        html += `<div style="margin-top:15px; padding:10px; background:rgba(255,215,0,0.1); border:1px solid var(--gold); border-radius:6px; font-weight:900; color:var(--gold);">📦 TOTAL BALE STOCK: ${baleCount} UNITS</div>`;
    }
    document.getElementById('fleetLog').innerHTML = html;
}

/**
 * REMAINING EXTRACTION FUNCTIONS (Farms, Missions, Fields, Items) [cite: 2026-02-13]
 */
function parseFinancials(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        if (f.getAttribute("farmId") === "1") document.getElementById('kevinFinance').innerText = money;
        if (f.getAttribute("farmId") === "2") document.getElementById('rayFinance').innerText = money;
    });
}

function parseMissionsDetailed(xml) {
    const active = Array.from(xml.getElementsByTagName("mission")).filter(m => m.getAttribute("status") === "1");
    document.getElementById('missionLog').innerHTML = active.map(m => `<div>[${m.getAttribute("type")}] FLD ${m.getAttribute("fieldId")} | $${parseFloat(m.getAttribute("reward")).toLocaleString()}</div>`).join('') || "NO ACTIVE CONTRACTS";
}

async function parsePrecisionDetailed(farmlandXml, pPath, fPath) {
    try {
        const [pRes, fRes] = await Promise.all([fetch(pPath + getTruthID()), fetch(fPath + getTruthID())]);
        const pXml = new DOMParser().parseFromString(await pRes.text(), "text/xml");
        const fXml = new DOMParser().parseFromString(await fRes.text(), "text/xml");
        const owned = Array.from(farmlandXml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") === "1");
        const pNodes = Array.from(pXml.getElementsByTagName("field"));
        const fNodes = Array.from(fXml.getElementsByTagName("field"));

        document.getElementById('module-1-field-info').innerHTML = `
            <div style="color:var(--gold); font-weight:900; margin-bottom:10px;">🌾 PRECISION INTELLIGENCE</div>
            ${owned.map(fmland => {
                const id = fmland.getAttribute("id");
                const p = pNodes.find(n => n.getAttribute("id") === id);
                const f = fNodes.find(n => n.getAttribute("id") === id);
                return `<div style="padding:10px; border-bottom:1px solid #222;">
                    <strong>FLD ${id}</strong>: ${f?.getAttribute("fruitType") || "STUBBLE"}
                    <div style="font-size:10px; opacity:0.6;">pH: ${parseFloat(p?.getAttribute("phValue") || 0).toFixed(1)} | N: ${parseFloat(p?.getAttribute("nitrogenValue") || 0).toFixed(0)}kg</div>
                </div>`;
            }).join('')}`;
    } catch (e) {}
}

function parseAnimalDetailed(xml) {
    const husbs = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("Husbandry"));
    document.getElementById('module-2-animal-info').innerHTML = `
        <div style="color:#a855f7; font-weight:900; margin-bottom:10px;">🐾 LIVESTOCK BIOMETRICS</div>
        ${husbs.map(h => `<div style="padding:10px; border-bottom:1px solid #222;">${h.getAttribute("filename").split('/').pop().toUpperCase()}</div>`).join('')}`;
}

function parseItemsDetailed(xml) {
    const items = Array.from(xml.getElementsByTagName("item"));
    document.getElementById('module-3-factory-info').innerHTML = `
        <div style="color:#ef4444; font-weight:900; margin-bottom:10px;">🏗️ PLACED ITEMS</div>
        ${items.map(i => `<div style="padding:8px; border-bottom:1px solid #222;">${i.getAttribute("className")}</div>`).join('')}`;
}

async function fetchLiveGPortal(url) {
    const status = document.getElementById('linkStatus');
    try {
        const res = await fetch(url + getTruthID());
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        if (xml.getElementsByTagName("Server")[0]) {
            status.textContent = "LINK LIVE"; status.className = "conn-status conn-live";
        }
    } catch (e) {}
}

async function injectBladeModule(id, file, xmlPath, parser) {
    try {
        const res = await fetch(`${file}${getTruthID()}`);
        if (res.ok) { document.getElementById(id).innerHTML = await res.text(); fetchDeepXML(xmlPath, parser); }
    } catch (e) {}
}

async function fetchDeepXML(url, parser) {
    try {
        const res = await fetch(url + getTruthID());
        if (res.ok) parser(new DOMParser().parseFromString(await res.text(), "text/xml"));
    } catch (e) {}
}
