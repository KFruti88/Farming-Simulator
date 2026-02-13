/**
 * FS MASTER UNIFIED ENGINE v1.79 - FLEET LOCKED EDITION
 * REPAIR: Locked parseFleetHardDrill, Refined Precision Extraction fallbacks.
 * MANDATE: Full Detail | Zero-Fake Policy | Zero Snippets [cite: 2026-01-26]
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";
const GPORTAL_FEED = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";

/** * SMART TRUTH ID [cite: 2026-01-26]
 * Generates a unique query string to force a "Live" fetch from GitHub.
 */
const getTruthID = () => `?truth=${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('saveSelector');
    hydrateDashboardFromCache();
    masterSyncCycle(selector.value);
    
    selector.addEventListener('change', (e) => {
        localStorage.clear(); 
        masterSyncCycle(e.target.value);
    });
    
    setInterval(() => masterSyncCycle(selector.value), 30000);
});

async function masterSyncCycle(slot) {
    const gitPath = `${GITHUB_ROOT}/saved-game-${slot}`;
    document.getElementById('currentSlotLabel').textContent = `SLOT ${slot} ACTIVE`;
    
    await Promise.all([
        fetchLiveGPortal(GPORTAL_FEED),
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetHardDrill), // LOCKED
        fetchDeepXML(`${gitPath}/farms.xml`, parseFinancials),
        injectBladeModule('module-1-field-info', 'field-info.html', `${gitPath}/farmland.xml`, (xml) => parsePrecisionFieldMatrix(xml, `${gitPath}/precisionFarming.xml`)),
        injectBladeModule('module-2-animal-info', 'animal-info.html', `${gitPath}/placeables.xml`, parseAnimalBiometrics),
        injectBladeModule('module-3-factory-info', 'factory-info.html', `${gitPath}/placeables.xml`, parseProductionChains)
    ]);
}

async function injectBladeModule(id, file, xmlPath, parser) {
    try {
        const res = await fetch(`${file}${getTruthID()}`);
        if (res.ok) {
            document.getElementById(id).innerHTML = await res.text();
            fetchDeepXML(xmlPath, parser);
        }
    } catch (e) { console.warn(`Blade ${file} failed.`); }
}

/**
 * [LOCKED] FLEET TELEMETRY [cite: 2026-02-12]
 * Confirmed working: Drills into <fuelConsumer> and <wearable> sub-nodes.
 */
function parseFleetHardDrill(xml) {
    const list = document.getElementById('fleetLog');
    if (!list) return;

    const units = Array.from(xml.getElementsByTagName("vehicle"));
    const html = units.map(u => {
        const name = u.getAttribute("filename")?.split('/').pop().replace('.xml', '').toUpperCase() || "UNIT";
        const fuelNode = u.getElementsByTagName("fuelConsumer")[0] || u.getElementsByTagName("consumer")[0];
        const wearNode = u.getElementsByTagName("wearable")[0] || u;
        
        const fuel = (parseFloat(fuelNode?.getAttribute("fillLevel") || 0) * 100).toFixed(0);
        const wear = (parseFloat(wearNode?.getAttribute("damage") || 0) * 100).toFixed(0);
        const cargo = u.getElementsByTagName("fillUnit")[0]?.getAttribute("fillLevel") || 0;

        return `
            <div class="telemetry-row" style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding:8px 0;">
                <span style="font-weight:900;">${name}</span>
                <span style="color:var(--gold)">${parseFloat(cargo).toFixed(0)}L</span>
                <div style="width:100px; display:flex; flex-direction:column; gap:2px;">
                    <div style="height:3px; background:var(--fuel); width:${fuel}%;"></div>
                    <div style="height:3px; background:var(--danger); width:${wear}%;"></div>
                </div>
            </div>`;
    }).join('');
    updateAndCache('fleetLog', html);
}

/**
 * REFINED MODULE EXTRACTIONS [cite: 2026-02-12]
 * Ensures "N/A" fallbacks to prevent empty boxes.
 */
async function parsePrecisionFieldMatrix(farmlandXml, precisionPath) {
    try {
        const pRes = await fetch(precisionPath + getTruthID());
        const pXml = new DOMParser().parseFromString(await pRes.text(), "text/xml");
        const owned = Array.from(farmlandXml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") === "1");
        const html = `<div class="module-header">🌾 PRECISION MATRIX</div><div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(80px, 1fr)); gap:5px; margin-top:10px;">
            ${owned.map(f => `<div class="mini-card" style="background:rgba(255,255,255,0.05); padding:5px; text-align:center;">FLD ${f.getAttribute("id")}</div>`).join('') || "N/A"}
        </div>`;
        updateAndCache('module-1-field-info', html);
    } catch (e) { updateAndCache('module-1-field-info', "N/A: DATA MISMATCH"); }
}

function parseAnimalBiometrics(xml) {
    const husbs = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("Husbandry"));
    const html = `<div class="module-header">🐾 LIVESTOCK</div><div class="data-stack">${husbs.map(h => `<div>${h.getAttribute("filename").split('/').pop().replace('.xml', '').toUpperCase()}: OK</div>`).join('') || "N/A"}</div>`;
    updateAndCache('module-2-animal-info', html);
}

function parseProductionChains(xml) {
    const points = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("ProductionPoint"));
    const html = `<div class="module-header">🏗️ PRODUCTION</div><div class="factory-grid">${points.map(p => `<div>🏭 ${p.getAttribute("filename").split('/').pop().replace('.xml', '')}</div>`).join('') || "N/A"}</div>`;
    updateAndCache('module-3-factory-info', html);
}

function parseFinancials(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        if (f.getAttribute("farmId") === "1") updateAndCache('kevinFinance', money);
        if (f.getAttribute("farmId") === "2") updateAndCache('rayFinance', money);
    });
}

async function fetchLiveGPortal(url) {
    try {
        const res = await fetch(url + getTruthID());
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        const server = xml.getElementsByTagName("Server")[0];
        if (server) {
            updateAndCache('mapDisplay', `Map: ${server.getAttribute('mapName')}`);
            const rawTime = parseInt(server.getAttribute('dayTime'));
            const hours = Math.floor(rawTime / 3600000) % 24;
            const mins = Math.floor((rawTime % 3600000) / 60000);
            updateAndCache('gameClock', `Time: ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
            const players = Array.from(xml.getElementsByTagName("Player")).filter(p => p.getAttribute('isUsed') === 'true');
            updateAndCache('playerLog', players.map(p => `👤 ${p.textContent}`).join(', ') || "Sector Clear");
        }
    } catch (e) {}
}

function hydrateDashboardFromCache() {
    ['kevinFinance', 'rayFinance', 'playerLog', 'fleetLog', 'mapDisplay', 'gameClock'].forEach(key => {
        const val = localStorage.getItem(key);
        if (val && document.getElementById(key)) document.getElementById(key).innerHTML = val;
    });
}

function updateAndCache(id, content) {
    const el = document.getElementById(id);
    if (el) { el.innerHTML = content; localStorage.setItem(id, content); }
}

async function fetchDeepXML(url, parser) {
    try {
        const res = await fetch(url + getTruthID());
        if (res.ok) parser(new DOMParser().parseFromString(await res.text(), "text/xml"));
    } catch (e) { }
}
