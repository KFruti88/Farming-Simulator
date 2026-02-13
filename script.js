/**
 * FS MASTER UNIFIED ENGINE v1.83 - FLEET INTELLIGENCE
 * REPAIR: Filtered Fleet Telemetry (Excludes Pallets/Rollers), Motorized-Only Fuel Display.
 * MANDATE: Full Detail | Zero-Fake Policy | Zero Snippets [cite: 2026-01-26]
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
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetHardDrill), // REFINED v1.83
        fetchDeepXML(`${gitPath}/farms.xml`, parseFinancials),
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
 * REFINED: FLEET INTELLIGENCE [cite: 2026-02-12]
 * Excludes pallets, rollers, and big bags. Only shows fuel for motorized units.
 */
function parseFleetHardDrill(xml) {
    const list = document.getElementById('fleetLog');
    if (!list) return;

    // Exclusion List: Hide these items if they appear in filename
    const excludedKeywords = ['PALLET', 'BIGBAG', 'ROLLER', 'BALE', 'QUICKBALE'];

    const units = Array.from(xml.getElementsByTagName("vehicle")).filter(u => {
        const name = u.getAttribute("filename")?.toUpperCase() || "";
        return !excludedKeywords.some(keyword => name.includes(keyword));
    });

    const html = units.map(u => {
        const rawName = u.getAttribute("filename")?.split('/').pop().replace('.xml', '').toUpperCase() || "UNIT";
        const cleanName = rawName.replace(/_/g, ' '); // Professional labels [cite: 2026-02-12]
        
        const fuelNode = u.getElementsByTagName("fuelConsumer")[0] || u.getElementsByTagName("consumer")[0];
        const wearNode = u.getElementsByTagName("wearable")[0] || u;
        
        const fuel = fuelNode ? (parseFloat(fuelNode.getAttribute("fillLevel") || 0) * 100).toFixed(0) : null;
        const wear = (parseFloat(wearNode?.getAttribute("damage") || 0) * 100).toFixed(0);
        const cargo = u.getElementsByTagName("fillUnit")[0]?.getAttribute("fillLevel") || 0;

        // Conditional Layout: Hide fuel for non-motorized items [cite: 2026-02-12]
        const fuelDisplay = fuel !== null ? `<span style="font-size:10px; opacity:0.8; color:var(--fuel)">${fuel}% FUEL</span>` : `<span style="font-size:10px; opacity:0.4;">TRAILER/WAGON</span>`;

        return `
            <div class="telemetry-row" style="display:grid; grid-template-columns: 2fr 1fr 1.5fr; gap:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding:8px 0; align-items:center;">
                <span style="font-weight:900; font-size:12px;">${cleanName}</span>
                <span style="color:var(--gold); font-size:11px;">${parseFloat(cargo).toFixed(0)}L</span>
                <div style="display:flex; flex-direction:column; gap:2px; text-align:right;">
                    ${fuelDisplay}
                    <span style="font-size:9px; opacity:0.6;">${wear}% WEAR</span>
                </div>
            </div>`;
    }).join('');

    updateAndCache('fleetLog', html || "NO ACTIVE MOBILE FLEET DETECTED");
}

/**
 * PRECISION & FINANCIALS [cite: 2026-01-27, 2026-02-12]
 */
async function parsePrecisionFieldMatrix(farmlandXml, precisionPath, fieldsPath) {
    try {
        const [pRes, fRes] = await Promise.all([fetch(precisionPath + getTruthID()), fetch(fieldsPath + getTruthID())]);
        const pXml = new DOMParser().parseFromString(await pRes.text(), "text/xml");
        const fXml = new DOMParser().parseFromString(await fRes.text(), "text/xml");
        const owned = Array.from(farmlandXml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") === "1");
        const pNodes = Array.from(pXml.getElementsByTagName("field"));
        const fNodes = Array.from(fXml.getElementsByTagName("field"));

        const html = `<div class="module-header" style="color:var(--gold); font-weight:900;">🌾 PRECISION INTELLIGENCE</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:10px; margin-top:10px;">
                ${owned.map(farmland => {
                    const id = farmland.getAttribute("id");
                    const soil = pNodes.find(n => n.getAttribute("id") === id);
                    const crop = fNodes.find(n => n.getAttribute("id") === id);
                    const fruit = crop ? crop.getAttribute("fruitType") || "EMPTY" : "STUBBLE";
                    const ph = soil ? parseFloat(soil.getAttribute("phValue") || 0) : 0;
                    return `<div class="field-card" style="background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                                <strong style="color:var(--safe)">FLD ${id}</strong> | <span style="font-size:10px;">${fruit}</span>
                                <div style="font-size:10px; margin-top:5px; opacity:0.7;">pH: ${ph.toFixed(1)}</div>
                            </div>`;
                }).join('')}
            </div>`;
        updateAndCache('module-1-field-info', html);
    } catch (e) { updateAndCache('module-1-field-info', "N/A: PRECISION DATA ERROR"); }
}

function parseFinancials(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        if (f.getAttribute("farmId") === "1") updateAndCache('kevinFinance', money);
        if (f.getAttribute("farmId") === "2") updateAndCache('rayFinance', money);
    });
}

function parseAnimalBiometrics(xml) { updateAndCache('module-2-animal-info', '<div class="loading">Analyzing Livestock...</div>'); }
function parseProductionChains(xml) { updateAndCache('module-3-factory-info', '<div class="loading">Syncing Warehouses...</div>'); }

async function fetchLiveGPortal(url) {
    try {
        const res = await fetch(url + getTruthID());
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        const server = xml.getElementsByTagName("Server")[0];
        if (server) {
            updateAndCache('mapDisplay', `Map: ${server.getAttribute('mapName')}`);
            const players = Array.from(xml.getElementsByTagName("Player")).filter(p => p.getAttribute('isUsed') === 'true');
            updateAndCache('playerLog', players.map(p => `👤 ${p.textContent}`).join(', ') || "Sector Clear");
        }
    } catch (e) {}
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
