/**
 * FS MASTER UNIFIED ENGINE v1.78 - TOTAL TRUTH EDITION
 * REPAIR: Resolved Empty Module Boxes via Node-Drilling and N/A Fallbacks.
 * MANDATE: Full Detail | Zero-Fake Policy | Zero Snippets [cite: 2026-01-26, 2026-02-08]
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
        // HARD-DRILL HANDSHAKES
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
 * MODULE 1: PRECISION FIELD MATRIX [cite: 2026-02-12]
 */
async function parsePrecisionFieldMatrix(farmlandXml, precisionPath) {
    try {
        const pRes = await fetch(precisionPath + getTruthID());
        const pXml = new DOMParser().parseFromString(await pRes.text(), "text/xml");
        const ownedFields = Array.from(farmlandXml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") === "1");
        const precisionNodes = Array.from(pXml.getElementsByTagName("field"));

        const html = `
            <div class="module-header" style="color:var(--gold); font-weight:900; border-bottom:1px solid rgba(255,215,0,0.3); padding-bottom:10px; margin-bottom:10px;">🌾 PRECISION SOIL MATRIX</div>
            <div class="field-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:8px;">
                ${ownedFields.map(f => {
                    const id = f.getAttribute("id") || "N/A";
                    const pData = precisionNodes.find(n => n.getAttribute("id") === id);
                    const nitrogen = pData ? parseFloat(pData.getAttribute("nitrogenValue") || 0).toFixed(0) : "N/A";
                    return `<div class="mini-card" style="background:rgba(255,255,255,0.05); padding:8px; border-radius:4px; text-align:center;">
                                <div style="color:var(--safe); font-weight:900;">FLD ${id}</div>
                                <div style="font-size:10px; opacity:0.7;">${nitrogen}kg N</div>
                            </div>`;
                }).join('') || "NO FIELDS OWNED"}
            </div>`;
        updateAndCache('module-1-field-info', html);
    } catch (e) { updateAndCache('module-1-field-info', "N/A: PRECISION DATA MISSING"); }
}

/**
 * MODULE 2: LIVESTOCK BIOMETRICS [cite: 2026-02-12]
 * Drills into placeables.xml <husbandry> and <animals> nodes.
 */
function parseAnimalBiometrics(xml) {
    const husbs = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("AnimalHusbandry"));
    
    const html = `
        <div class="module-header" style="color:#a855f7; font-weight:900; border-bottom:1px solid rgba(168,85,247,0.3); padding-bottom:10px; margin-bottom:10px;">🐾 LIVESTOCK BIOMETRICS</div>
        <div class="data-stack" style="display:flex; flex-direction:column; gap:6px;">
            ${husbs.map(h => {
                const fileName = h.getAttribute("filename") || "UNKNOWN";
                const type = fileName.split('/').pop().replace('.xml', '').toUpperCase();
                const animals = h.getElementsByTagName("animal");
                const health = animals.length > 0 ? (parseFloat(animals[0].getAttribute("health") || 0)).toFixed(0) : "N/A";
                return `
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; display:flex; justify-content:space-between;">
                        <div style="font-weight:900; font-size:12px;">${type}</div>
                        <div style="color:var(--safe); font-weight:900;">${health}% HEALTH</div>
                    </div>`;
            }).join('') || "N/A: NO LIVESTOCK DETECTED"}
        </div>`;
    updateAndCache('module-2-animal-info', html);
}

/**
 * MODULE 3: PRODUCTION CHAINS [cite: 2026-02-12]
 */
function parseProductionChains(xml) {
    const factories = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("ProductionPoint"));
    
    const html = `
        <div class="module-header" style="color:#ef4444; font-weight:900; border-bottom:1px solid rgba(239,68,68,0.3); padding-bottom:10px; margin-bottom:10px;">🏗️ PRODUCTION LOGISTICS</div>
        <div class="factory-grid" style="display:grid; gap:8px;">
            ${factories.map(f => {
                const name = f.getAttribute("filename")?.split('/').pop().replace('.xml', '').toUpperCase() || "FACTORY";
                const storage = f.getElementsByTagName("storage")[0];
                const totalFill = storage ? Array.from(storage.getElementsByTagName("fillLevel")).reduce((sum, node) => sum + parseFloat(node.textContent || 0), 0) : 0;
                return `
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:6px;">
                        <div style="font-weight:900; font-size:11px; margin-bottom:4px;">${name}</div>
                        <div style="display:flex; justify-content:space-between; font-size:10px;">
                            <span class="data-label">TOTAL STOCK:</span>
                            <span class="data-value">${totalFill.toFixed(0)}L</span>
                        </div>
                    </div>`;
            }).join('') || "N/A: NO PRODUCTION ACTIVE"}
        </div>`;
    updateAndCache('module-3-factory-info', html);
}

/**
 * FLEET TELEMETRY [cite: 2026-02-12]
 */
function parseFleetHardDrill(xml) {
    const units = Array.from(xml.getElementsByTagName("vehicle"));
    const html = units.map(u => {
        const name = u.getAttribute("filename")?.split('/').pop().replace('.xml', '').toUpperCase() || "UNIT";
        const fuel = (parseFloat(u.getElementsByTagName("fuelConsumer")[0]?.getAttribute("fillLevel") || 0) * 100).toFixed(0);
        const cargo = u.getElementsByTagName("fillUnit")[0]?.getAttribute("fillLevel") || 0;
        return `<div class="telemetry-row" style="display:flex; justify-content:space-between; font-size:12px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <span>${name}</span>
                    <span style="color:var(--gold)">${parseFloat(cargo).toFixed(0)}L</span>
                    <span style="opacity:0.6">${fuel}% FUEL</span>
                </div>`;
    }).join('');
    updateAndCache('fleetLog', html);
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
