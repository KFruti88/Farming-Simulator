/**
 * FS MASTER UNIFIED ENGINE v2.01 - SYSTEM INTEGRITY
 * REPAIR: Comprehensive drilling of careerSavegame, items, and missions XMLs.
 * MANDATE: Full Detail | Zero Snippets | Zero-Fake Policy [cite: 2026-01-26, 2026-02-13]
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
    document.getElementById('currentSlotLabel').textContent = `1:1 SYNC SLOT ${slot}`;
    
    await Promise.all([
        fetchLiveGPortal(GPORTAL_FEED),
        fetchDeepXML(`${gitPath}/careerSavegame.xml`, parseCareerData), // [cite: 2026-02-13]
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetDetailed),
        fetchDeepXML(`${gitPath}/farms.xml`, parseFinancials),
        fetchDeepXML(`${gitPath}/missions.xml`, parseMissionsDetailed),
        fetchDeepXML(`${gitPath}/players.xml`, parsePlayerDetailed),
        injectBladeModule('module-1-field-info', 'field-info.html', `${gitPath}/farmland.xml`, 
            (xml) => parsePrecisionDetailed(xml, `${gitPath}/precisionFarming.xml`, `${gitPath}/fields.xml`)),
        injectBladeModule('module-2-animal-info', 'animal-info.html', `${gitPath}/placeables.xml`, parseAnimalDetailed),
        injectBladeModule('module-3-factory-info', 'factory-info.html', `${gitPath}/items.xml`, parseItemsDetailed) // [cite: 2026-02-13]
    ]);
}

/**
 * 1. CORE INTELLIGENCE: careerSavegame.xml [cite: 2026-02-13]
 */
function parseCareerData(xml) {
    const settings = xml.getElementsByTagName("settings")[0];
    const money = parseFloat(settings?.getElementsByTagName("money")[0]?.textContent || 0).toLocaleString();
    const day = settings?.getElementsByTagName("dayOfYear")[0]?.textContent || "1";
    updateAndCache('envDate', `Game Day: ${day}`);
}

/**
 * 2. OBJECT EXTRACTION: items.xml [cite: 2026-02-13]
 * Drills into placed objects, greenhouses, and solar panels.
 */
function parseItemsDetailed(xml) {
    const items = Array.from(xml.getElementsByTagName("item"));
    const html = `<div class="module-header" style="color:#ef4444; font-weight:900; border-bottom:1px solid rgba(239,68,68,0.3); padding-bottom:10px;">🏗️ PLACED ITEMS & ASSETS</div>
        <div style="margin-top:15px; display:grid; gap:10px;">
            ${items.map(i => {
                const type = i.getAttribute("className") || "OBJECT";
                const filename = i.getAttribute("filename")?.split('/').pop() || "";
                const fill = i.getElementsByTagName("fillLevel")[0];
                return `
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; border:1px solid rgba(239,68,68,0.2);">
                        <div style="font-weight:900; font-size:11px; color:var(--gold);">${type.toUpperCase()}</div>
                        <div style="font-size:10px; opacity:0.6;">${filename}</div>
                        ${fill ? `<div style="font-size:10px; margin-top:5px; font-weight:900;">STOCK: ${parseFloat(fill.textContent).toFixed(0)}L</div>` : ''}
                    </div>`;
            }).join('') || "NO PLACED ITEMS DETECTED"}
        </div>`;
    updateAndCache('module-3-factory-info', html);
}

/**
 * 3. FLEET EXTRACTION: vehicles.xml [cite: 2026-02-13]
 * Shows fuel, dirt levels, and full fillUnit breakdown.
 */
function parseFleetDetailed(xml) {
    const units = Array.from(xml.getElementsByTagName("vehicle"));
    const html = units.map(u => {
        const name = u.getAttribute("filename")?.split('/').pop().toUpperCase().replace(/_/g, ' ') || "UNIT";
        const wear = (parseFloat(u.getElementsByTagName("wearable")[0]?.getAttribute("damage") || 0) * 100).toFixed(0);
        const dirt = (parseFloat(u.getAttribute("dirtAmount") || 0) * 100).toFixed(0);
        const fills = Array.from(u.getElementsByTagName("fillUnit")).filter(f => parseFloat(f.getAttribute("fillLevel")) > 0);

        return `
            <div class="telemetry-row" style="display:grid; grid-template-columns: 1.5fr 2fr 1fr; gap:15px; border-bottom:1px solid rgba(255,255,255,0.05); padding:10px 0; align-items:start;">
                <span style="font-weight:900; font-size:12px;">${name}</span>
                <div style="font-size:10px; opacity:0.8;">
                    ${fills.map(f => `<div>${f.getAttribute("fillType")}: ${parseFloat(f.getAttribute("fillLevel")).toFixed(0)}L</div>`).join('') || "EMPTY"}
                </div>
                <div style="text-align:right; font-size:9px; opacity:0.6;">
                    DMG: ${wear}%<br>DIRT: ${dirt}%
                </div>
            </div>`;
    }).join('');
    updateAndCache('fleetLog', html || "NO DATA FOUND");
}

function parseFinancials(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        if (f.getAttribute("farmId") === "1") updateAndCache('kevinFinance', money);
        if (f.getAttribute("farmId") === "2") updateAndCache('rayFinance', money);
    });
}

function parseMissionsDetailed(xml) {
    const active = Array.from(xml.getElementsByTagName("mission")).filter(m => m.getAttribute("status") === "1");
    const html = active.map(m => `
        <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding:5px 0;">
            <strong style="color:var(--gold)">[${m.getAttribute("type")}]</strong> FLD ${m.getAttribute("fieldId")} | 
            REWARD: $${parseFloat(m.getAttribute("reward")).toLocaleString()}
        </div>`).join('') || "NO ACTIVE CONTRACTS";
    updateAndCache('missionLog', html);
}

function parsePlayerDetailed(xml) {
    Array.from(xml.getElementsByTagName("player")).forEach(p => {
        const stats = p.getElementsByTagName("stats")[0];
        const content = `Hours: ${(parseFloat(stats?.getAttribute("playTime") || 0)/60).toFixed(1)} | Helpers: ${stats?.getAttribute("hiredHelperCount") || 0}`;
        if (p.getAttribute("name") === "werewolf3788") updateAndCache('kevinStats', content);
        if (p.getAttribute("name") === "raymystro") updateAndCache('rayStats', content);
    });
}

async function parsePrecisionDetailed(farmlandXml, precisionPath, fieldsPath) {
    try {
        const [pRes, fRes] = await Promise.all([fetch(precisionPath + getTruthID()), fetch(fieldsPath + getTruthID())]);
        const pXml = new DOMParser().parseFromString(await pRes.text(), "text/xml");
        const fXml = new DOMParser().parseFromString(await fRes.text(), "text/xml");
        const owned = Array.from(farmlandXml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") === "1");
        const pNodes = Array.from(pXml.getElementsByTagName("field"));
        const fNodes = Array.from(fXml.getElementsByTagName("field"));

        const html = `<div class="module-header" style="color:var(--gold); font-weight:900; border-bottom:1px solid rgba(255,215,0,0.3); padding-bottom:10px;">🌾 PRECISION INTELLIGENCE MATRIX</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:12px; margin-top:15px;">
                ${owned.map(fmland => {
                    const id = fmland.getAttribute("id");
                    const p = pNodes.find(n => n.getAttribute("id") === id);
                    const f = fNodes.find(n => n.getAttribute("id") === id);
                    return `
                        <div class="field-card" style="background:rgba(255,255,255,0.05); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                <strong style="color:var(--safe)">FLD ${id}</strong>
                                <span style="font-size:10px; opacity:0.6;">${f?.getAttribute("state") || "READY"}</span>
                            </div>
                            <div style="font-size:13px; font-weight:900; color:white; margin-bottom:8px;">${f?.getAttribute("fruitType") || "EMPTY"}</div>
                            <div style="font-size:10px; opacity:0.8; display:grid; grid-template-columns: 1fr 1fr; gap:3px;">
                                <div>pH: ${parseFloat(p?.getAttribute("phValue") || 0).toFixed(1)}</div>
                                <div>N: ${parseFloat(p?.getAttribute("nitrogenValue") || 0).toFixed(0)}kg</div>
                                <div>SOIL: ${p?.getAttribute("soilType") || "N/A"}</div>
                                <div>POT: ${parseFloat(p?.getAttribute("yieldPotential") || 0 * 100).toFixed(0)}%</div>
                            </div>
                        </div>`;
                }).join('')}
            </div>`;
        updateAndCache('module-1-field-info', html);
    } catch (e) { updateAndCache('module-1-field-info', "N/A: DATA PENDING"); }
}

function parseAnimalDetailed(xml) {
    const husbs = Array.from(xml.getElementsByTagName("placeable")).filter(p => p.getAttribute("class")?.includes("Husbandry"));
    const html = `<div class="module-header" style="color:#a855f7; font-weight:900; border-bottom:1px solid rgba(168,85,247,0.3); padding-bottom:10px;">🐾 LIVESTOCK BIOMETRICS</div>
        <div style="margin-top:15px; display:grid; gap:10px;">
            ${husbs.map(h => {
                const animals = Array.from(h.getElementsByTagName("animal"));
                const storage = Array.from(h.getElementsByTagName("fillLevel")).filter(f => parseFloat(f.textContent) > 0);
                return `
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; border:1px solid rgba(168,85,247,0.2);">
                        <div style="font-weight:900; color:#d8b4fe; font-size:11px;">${h.getAttribute("filename").split('/').pop().toUpperCase()}</div>
                        <div style="font-size:10px; margin:5px 0;">POPULATION: ${animals.length}</div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; font-size:9px; opacity:0.7;">
                            ${storage.map(f => `<div>${f.getAttribute("fillType")}: ${parseFloat(f.textContent).toFixed(0)}L</div>`).join('')}
                        </div>
                    </div>`;
            }).join('') || "NO LIVESTOCK"}
        </div>`;
    updateAndCache('module-2-animal-info', html);
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
            status.textContent = "LINK LIVE"; status.className = "conn-status conn-live";
        }
    } catch (e) { status.textContent = "LINK BLOCKED"; status.className = "conn-status conn-blocked"; }
}

function hydrateDashboardFromCache() {
    ['kevinFinance', 'rayFinance', 'fleetLog', 'mapDisplay', 'missionLog'].forEach(key => {
        const val = localStorage.getItem(key);
        if (val && document.getElementById(key)) document.getElementById(key).innerHTML = val;
    });
}

function updateAndCache(id, content) {
    const el = document.getElementById(id);
    if (el) { el.innerHTML = content; localStorage.setItem(id, content); }
}

async function injectBladeModule(id, file, xmlPath, parser) {
    try {
        const res = await fetch(`${file}${getTruthID()}`);
        if (res.ok) { document.getElementById(id).innerHTML = await res.text(); fetchDeepXML(xmlPath, parser); }
    } catch (e) { }
}

async function fetchDeepXML(url, parser) {
    try {
        const res = await fetch(url + getTruthID());
        if (res.ok) parser(new DOMParser().parseFromString(await res.text(), "text/xml"));
    } catch (e) { }
}
