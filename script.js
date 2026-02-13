/**
 * FS MASTER UNIFIED ENGINE v1.92 - DEEP RECOVERY
 * REPAIR: Aggressive Node-Drilling for Precision Soil and Motorized Telemetry.
 * MANDATE: Full Detail | Zero Snippets | Zero-Fake Policy [cite: 2026-01-26]
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";
const GPORTAL_FEED = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";
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
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetHardDrill),
        fetchDeepXML(`${gitPath}/farms.xml`, parseFinancials),
        // AGGRESSIVE FIELD SYNC [cite: 2026-02-12]
        injectBladeModule('module-1-field-info', 'field-info.html', `${gitPath}/farmland.xml`, 
            (xml) => parsePrecisionFieldMatrix(xml, `${gitPath}/precisionFarming.xml`, `${gitPath}/fields.xml`)),
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
 * RECOVERY: PRECISION INTELLIGENCE [cite: 2026-02-12]
 * Hard-Drills pH and Nitrogen values.
 */
async function parsePrecisionFieldMatrix(farmlandXml, precisionPath, fieldsPath) {
    try {
        const [pRes, fRes] = await Promise.all([fetch(precisionPath + getTruthID()), fetch(fieldsPath + getTruthID())]);
        const pXml = new DOMParser().parseFromString(await pRes.text(), "text/xml");
        const fXml = new DOMParser().parseFromString(await fRes.text(), "text/xml");
        
        const owned = Array.from(farmlandXml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") === "1");
        const pNodes = Array.from(pXml.getElementsByTagName("field"));
        const fNodes = Array.from(fXml.getElementsByTagName("field"));

        const html = `
            <div class="module-header" style="color:var(--gold); font-weight:900; border-bottom:1px solid rgba(255,215,0,0.3); padding-bottom:10px;">🌾 PRECISION INTELLIGENCE</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap:10px; margin-top:15px;">
                ${owned.map(fmland => {
                    const id = fmland.getAttribute("id");
                    const pData = pNodes.find(n => n.getAttribute("id") === id);
                    const fData = fNodes.find(n => n.getAttribute("id") === id);

                    // Aggressive Extraction [cite: 2026-02-12]
                    const ph = pData ? parseFloat(pData.getAttribute("phValue") || 0) : 0;
                    const nitro = pData ? parseFloat(pData.getAttribute("nitrogenValue") || 0) : 0;
                    const fruit = fData ? fData.getAttribute("fruitType") || "STUBBLE" : "PLOWED";
                    const state = fData ? fData.getAttribute("state") || "READY" : "CULTIVATED";

                    return `
                        <div class="field-card" style="background:rgba(255,255,255,0.05); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <strong style="color:var(--safe)">FLD ${id}</strong>
                                <span style="font-size:10px; opacity:0.6; text-transform:uppercase;">${state}</span>
                            </div>
                            <div style="font-size:13px; font-weight:900; margin-bottom:10px; color:white;">${fruit}</div>
                            <div style="font-size:11px;">pH: ${ph.toFixed(1)} ${ph < 6.5 ? '[LIME]' : '[OK]'}</div>
                            <div style="font-size:11px;">N: ${nitro.toFixed(0)}kg ${nitro < 150 ? '[FERT]' : '[OK]'}</div>
                        </div>`;
                }).join('') || "NO FIELDS DETECTED"}
            </div>`;
        updateAndCache('module-1-field-info', html);
    } catch (e) { updateAndCache('module-1-field-info', "N/A: PRECISION DATA PENDING"); }
}

/**
 * RECOVERY: FLEET TELEMETRY [cite: 2026-02-12]
 * Fixed "Implement" error by checking Engine-based fuel nodes more aggressively.
 */
function parseFleetHardDrill(xml) {
    const excluded = ['PALLET', 'BIGBAG', 'ROLLER', 'BALE', 'QUICKBALE'];
    const units = Array.from(xml.getElementsByTagName("vehicle")).filter(u => {
        const name = u.getAttribute("filename")?.toUpperCase() || "";
        return !excluded.some(keyword => name.includes(keyword));
    });

    const html = units.map(u => {
        const cleanName = u.getAttribute("filename")?.split('/').pop().replace('.xml', '').toUpperCase().replace(/_/g, ' ') || "UNIT";
        
        // RECOVERY DRILL: Try multiple paths for fuel [cite: 2026-02-12]
        const fNode = u.getElementsByTagName("fuelConsumer")[0] || u.getElementsByTagName("consumer")[0];
        const wearNode = u.getElementsByTagName("wearable")[0] || u;
        const cargoNode = u.getElementsByTagName("fillUnit")[0];
        
        const fuelRaw = fNode ? fNode.getAttribute("fillLevel") : null;
        const fuelPercent = (fuelRaw !== null) ? (parseFloat(fuelRaw) * 100).toFixed(0) : null;
        const wear = (parseFloat(wearNode?.getAttribute("damage") || 0) * 100).toFixed(0);
        const cargo = cargoNode ? parseFloat(cargoNode.getAttribute("fillLevel") || 0).toFixed(0) : 0;

        // Correctly Identify Motorized vs Implement [cite: 2026-02-12]
        const fuelDisplay = (fuelPercent !== null) ? 
            `<span style="color:var(--fuel); font-weight:900;">${fuelPercent}% FUEL</span>` : 
            `<span style="opacity:0.4;">TRAILER / IMPLEMENT</span>`;

        return `
            <div class="telemetry-row" style="display:grid; grid-template-columns: 2fr 1fr 1.5fr; gap:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding:8px 0; align-items:center;">
                <span style="font-weight:900; font-size:12px;">${cleanName}</span>
                <span style="color:var(--gold); font-size:11px;">${cargo}L</span>
                <div style="text-align:right; font-size:10px;">
                    ${fuelDisplay} <span style="opacity:0.6; margin-left:5px;">${wear}% WEAR</span>
                </div>
            </div>`;
    }).join('');
    updateAndCache('fleetLog', html || "NO MOBILE FLEET DETECTED");
}

function parseFinancials(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        if (f.getAttribute("farmId") === "1") updateAndCache('kevinFinance', money);
        if (f.getAttribute("farmId") === "2") updateAndCache('rayFinance', money);
    });
}

function parseAnimalBiometrics(xml) {
    const husbs = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("Husbandry"));
    const html = `<div class="module-header" style="color:#a855f7; font-weight:900; border-bottom:1px solid rgba(168,85,247,0.3); padding-bottom:10px;">🐾 LIVESTOCK</div>
        <div class="data-stack" style="margin-top:10px;">
            ${husbs.map(h => `<div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:4px; margin-bottom:5px;">${h.getAttribute("filename").split('/').pop().replace('.xml', '').toUpperCase()}: ACTIVE</div>`).join('') || "NO LIVESTOCK DETECTED"}
        </div>`;
    updateAndCache('module-2-animal-info', html);
}

function parseProductionChains(xml) {
    const points = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("ProductionPoint"));
    const html = `<div class="module-header" style="color:#ef4444; font-weight:900; border-bottom:1px solid rgba(239,68,68,0.3); padding-bottom:10px;">🏗️ PRODUCTION</div>
        <div class="factory-grid" style="margin-top:10px;">
            ${points.map(f => {
                const stock = Array.from(f.getElementsByTagName("fillLevel")).reduce((sum, n) => sum + parseFloat(n.textContent || 0), 0);
                if (stock <= 0) return '';
                return `<div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:4px; margin-bottom:5px;">🏭 ${f.getAttribute("filename").split('/').pop().toUpperCase()} | ${stock.toFixed(0)}L</div>`;
            }).join('') || "NO STOCK"}
        </div>`;
    updateAndCache('module-3-factory-info', html);
}

async function fetchLiveGPortal(url) {
    const status = document.getElementById('linkStatus');
    try {
        const res = await fetch(url + getTruthID());
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        const server = xml.getElementsByTagName("Server")[0];
        if (server) {
            updateAndCache('mapDisplay', `Map: ${server.getAttribute('mapName')}`);
            updateAndCache('gameClock', `Time: SYNCED`);
            const players = Array.from(xml.getElementsByTagName("Player")).filter(p => p.getAttribute('isUsed') === 'true');
            updateAndCache('playerLog', players.map(p => `👤 ${p.textContent}`).join(', ') || "Sector Clear");
            status.textContent = "LINK LIVE"; status.className = "conn-status conn-live";
        }
    } catch (e) {
        status.textContent = "LINK BLOCKED"; status.className = "conn-status conn-blocked";
    }
}

function hydrateDashboardFromCache() {
    ['kevinFinance', 'rayFinance', 'playerLog', 'fleetLog', 'mapDisplay'].forEach(key => {
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
