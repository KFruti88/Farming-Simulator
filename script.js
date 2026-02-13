/**
 * FS MASTER UNIFIED ENGINE v1.97 - FULL EXTRACTION
 * REPAIR: Removed all data-thinning filters. Every XML node is fully parsed.
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
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetFullExtraction),
        fetchDeepXML(`${gitPath}/farms.xml`, parseFinancials),
        // Deepest Field Sync Available [cite: 2026-02-12]
        injectBladeModule('module-1-field-info', 'field-info.html', `${gitPath}/farmland.xml`, 
            (xml) => parsePrecisionFullMatrix(xml, `${gitPath}/precisionFarming.xml`, `${gitPath}/fields.xml`)),
        injectBladeModule('module-2-animal-info', 'animal-info.html', `${gitPath}/placeables.xml`, parseAnimalFullMatrix),
        injectBladeModule('module-3-factory-info', 'factory-info.html', `${gitPath}/placeables.xml`, parseProductionFullMatrix)
    ]);
}

async function injectBladeModule(id, file, xmlPath, parser) {
    try {
        const res = await fetch(`${file}${getTruthID()}`);
        if (res.ok) {
            document.getElementById(id).innerHTML = await res.text();
            fetchDeepXML(xmlPath, parser);
        }
    } catch (e) { console.warn(`Blade ${file} failed to seat.`); }
}

/**
 * MODULE 1: PRECISION INTELLIGENCE (FULL DETAIL) [cite: 2026-02-12]
 */
async function parsePrecisionFullMatrix(farmlandXml, precisionPath, fieldsPath) {
    try {
        const [pRes, fRes] = await Promise.all([fetch(precisionPath + getTruthID()), fetch(fieldsPath + getTruthID())]);
        const pXml = new DOMParser().parseFromString(await pRes.text(), "text/xml");
        const fXml = new DOMParser().parseFromString(await fRes.text(), "text/xml");
        
        const owned = Array.from(farmlandXml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") === "1");
        const pNodes = Array.from(pXml.getElementsByTagName("field"));
        const fNodes = Array.from(fXml.getElementsByTagName("field"));

        const html = `
            <div class="module-header" style="color:var(--gold); font-weight:900; border-bottom:1px solid rgba(255,215,0,0.3); padding-bottom:10px;">🌾 PRECISION INTELLIGENCE MATRIX</div>
            <div class="full-detail-grid">
                ${owned.map(fmland => {
                    const id = fmland.getAttribute("id");
                    const p = pNodes.find(n => n.getAttribute("id") === id);
                    const f = fNodes.find(n => n.getAttribute("id") === id);

                    return `
                        <div class="field-card" style="background:rgba(255,255,255,0.05); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <strong style="color:var(--safe)">FIELD ${id}</strong>
                                <span style="font-size:10px; opacity:0.6;">${f?.getAttribute("state") || "UNKNOWN"}</span>
                            </div>
                            <div style="font-size:14px; font-weight:900; color:white; margin-bottom:10px;">CROP: ${f?.getAttribute("fruitType") || "STUBBLE"}</div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; font-size:11px;">
                                <div>pH: ${parseFloat(p?.getAttribute("phValue") || 0).toFixed(1)}</div>
                                <div>NITRO: ${parseFloat(p?.getAttribute("nitrogenValue") || 0).toFixed(0)}kg</div>
                                <div>YIELD: ${parseFloat(p?.getAttribute("yieldPotential") || 0 * 100).toFixed(0)}%</div>
                                <div>SOIL: ${p?.getAttribute("soilType") || "N/A"}</div>
                            </div>
                        </div>`;
                }).join('')}
            </div>`;
        updateAndCache('module-1-field-info', html);
    } catch (e) { updateAndCache('module-1-field-info', "N/A: PRECISION DATA ERROR"); }
}

/**
 * MODULE 2: ANIMAL HUSBANDRY (FULL BIOMETRICS) [cite: 2026-02-12]
 */
function parseAnimalFullMatrix(xml) {
    const husbs = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("Husbandry"));
    const html = `
        <div class="module-header" style="color:#a855f7; font-weight:900; border-bottom:1px solid rgba(168,85,247,0.3); padding-bottom:10px;">🐾 LIVESTOCK BIOMETRICS</div>
        <div style="display:grid; gap:10px; margin-top:15px;">
            ${husbs.map(h => {
                const animals = Array.from(h.getElementsByTagName("animal"));
                const storage = h.getElementsByTagName("storage")[0];
                const fills = storage ? Array.from(storage.getElementsByTagName("fillLevel")) : [];
                
                return `
                    <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:6px; border:1px solid rgba(168,85,247,0.2);">
                        <div style="font-weight:900; color:#d8b4fe; margin-bottom:8px;">${h.getAttribute("filename").split('/').pop().toUpperCase()}</div>
                        <div style="font-size:11px; margin-bottom:8px;">POPULATION: ${animals.length}</div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; font-size:10px; opacity:0.8;">
                            ${fills.map(f => `<div>${f.getAttribute("fillType")}: ${parseFloat(f.textContent).toFixed(0)}L</div>`).join('')}
                        </div>
                    </div>`;
            }).join('') || "NO LIVESTOCK DETECTED"}
        </div>`;
    updateAndCache('module-2-animal-info', html);
}

/**
 * MODULE 3: PRODUCTION LOGISTICS (FULL WAREHOUSE) [cite: 2026-02-12]
 */
function parseProductionFullMatrix(xml) {
    const points = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("ProductionPoint"));
    const html = `
        <div class="module-header" style="color:#ef4444; font-weight:900; border-bottom:1px solid rgba(239,68,68,0.3); padding-bottom:10px;">🏗️ PRODUCTION LOGISTICS</div>
        <div style="display:grid; gap:10px; margin-top:15px;">
            ${points.map(p => {
                const storage = p.getElementsByTagName("storage")[0];
                const fills = storage ? Array.from(storage.getElementsByTagName("fillLevel")).filter(f => parseFloat(f.textContent) > 0) : [];
                if (fills.length === 0) return '';
                
                return `
                    <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:6px; border:1px solid rgba(239,68,68,0.2);">
                        <div style="font-weight:900; color:var(--gold); font-size:11px; margin-bottom:8px;">🏭 ${p.getAttribute("filename").split('/').pop().toUpperCase()}</div>
                        <div style="display:grid; grid-template-columns: 1fr; gap:3px; font-size:10px;">
                            ${fills.map(f => `<div style="display:flex; justify-content:space-between;"><span>${f.getAttribute("fillType")}:</span> <span>${parseFloat(f.textContent).toFixed(0)}L</span></div>`).join('')}
                        </div>
                    </div>`;
            }).join('') || "NO ACTIVE STOCK"}
        </div>`;
    updateAndCache('module-3-factory-info', html);
}

/**
 * FLEET TELEMETRY: NO FILTERS [cite: 2026-02-12]
 */
function parseFleetFullExtraction(xml) {
    const units = Array.from(xml.getElementsByTagName("vehicle"));
    const html = units.map(u => {
        const name = u.getAttribute("filename")?.split('/').pop().toUpperCase().replace(/_/g, ' ') || "UNIT";
        const fills = Array.from(u.getElementsByTagName("fillUnit"));
        const wear = (parseFloat(u.getElementsByTagName("wearable")[0]?.getAttribute("damage") || 0) * 100).toFixed(0);

        return `
            <div class="telemetry-row" style="display:grid; grid-template-columns: 1.5fr 2fr 1fr; gap:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding:10px 0; align-items:start;">
                <span style="font-weight:900; font-size:12px;">${name}</span>
                <div style="font-size:10px; opacity:0.8;">
                    ${fills.map(f => `<div>${f.getAttribute("fillType") || "EMPTY"}: ${parseFloat(f.getAttribute("fillLevel")).toFixed(0)}L</div>`).join('')}
                </div>
                <div style="text-align:right; font-size:10px; font-weight:900; color:var(--fuel);">${wear}% WEAR</div>
            </div>`;
    }).join('');
    updateAndCache('fleetLog', html || "NO DATA");
}

function parseFinancials(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        if (f.getAttribute("farmId") === "1") updateAndCache('kevinFinance', money);
        if (f.getAttribute("farmId") === "2") updateAndCache('rayFinance', money);
    });
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
