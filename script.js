/**
 * FS MASTER UNIFIED ENGINE v2.14 - 60-BOX IDENTITY SYNC
 * REPAIR: Cross-references farmId ownership for Kevin (F1) and Ray (F2) across all 20 slots.
 * MANDATE: Full Detail | Zero Snippets | Zero-Fake Policy [cite: 2026-01-26]
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";
const getTruthID = () => `?truth=${Date.now()}`;

document.addEventListener('DOMContentLoaded', () => {
    buildMatrixStructure(); // Generates the 60-box viewport [cite: 2026-02-13]
    syncGlobalMatrix();
    setInterval(syncGlobalMatrix, 60000);
});

function buildMatrixStructure() {
    const grid = document.getElementById('masterMatrixGrid');
    for (let i = 1; i <= 20; i++) {
        const row = document.createElement('div');
        row.className = 'save-row';
        row.innerHTML = `
            <div class="row-header">OPERATIONAL MATRIX: SLOT ${i}</div>
            <div class="box-container">
                <div class="scroll-box" id="slot-${i}-farmland">
                    <div class="box-title">🌾 FARMLAND OWNERSHIP</div>
                    <div class="content">Drilling XML...</div>
                </div>
                <div class="scroll-box" id="slot-${i}-missions">
                    <div class="box-title">📑 IDENTITY CONTRACTS</div>
                    <div class="content">Drilling XML...</div>
                </div>
                <div class="scroll-box" id="slot-${i}-fleet">
                    <div class="box-title">🚜 UNIT & ASSET TELEMETRY</div>
                    <div class="content">Drilling XML...</div>
                </div>
            </div>`;
        grid.appendChild(row);
    }
}

async function syncGlobalMatrix() {
    for (let i = 1; i <= 20; i++) {
        const path = `${GITHUB_ROOT}/saved-game-${i}`;
        processSlotData(i, path);
    }
}

async function processSlotData(id, path) {
    try {
        const [fml, pre, mis, vml, iml] = await Promise.all([
            fetchXML(`${path}/farmland.xml`), fetchXML(`${path}/precisionFarming.xml`),
            fetchXML(`${path}/missions.xml`), fetchXML(`${path}/vehicles.xml`), fetchXML(`${path}/items.xml`)
        ]);

        if (fml) renderFarmlandDetailed(id, fml, pre);
        if (mis) renderMissionsDetailed(id, mis);
        if (vml) renderFleetDetailed(id, vml, iml);
    } catch (e) { console.warn(`Slot ${id} sync pending.`); }
}

/**
 * BOX 1: FARMLAND [cite: 2026-02-13]
 */
function renderFarmlandDetailed(id, fml, pre) {
    const lands = Array.from(fml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") !== "0");
    const pNodes = Array.from(pre?.getElementsByTagName("field") || []);

    const html = lands.map(l => {
        const ownerId = l.getAttribute("farmId");
        const colorClass = ownerId === "1" ? "owner-kevin" : "owner-ray";
        const lid = l.getAttribute("id");
        const p = pNodes.find(n => n.getAttribute("id") === lid);

        return `
            <div class="item-row ${colorClass}">
                <strong>FIELD ${lid}</strong> | ${ownerId === "1" ? 'KEVIN' : 'RAY'}
                <div style="font-size:10px; margin-top:5px; opacity:0.7;">
                    pH: ${parseFloat(p?.getAttribute("phValue") || 0).toFixed(1)} | 
                    N: ${parseFloat(p?.getAttribute("nitrogenValue") || 0).toFixed(0)}kg
                </div>
            </div>`;
    }).join('');
    document.querySelector(`#slot-${id}-farmland .content`).innerHTML = html || "NO LAND OWNED";
}

/**
 * BOX 2: MISSIONS [cite: 2026-02-13]
 */
function renderMissionsDetailed(id, xml) {
    const active = Array.from(xml.getElementsByTagName("mission")).filter(m => m.getAttribute("status") === "1");
    const html = active.map(m => {
        const farmId = m.getAttribute("farmId");
        const colorClass = farmId === "1" ? "owner-kevin" : "owner-ray";
        
        return `
            <div class="item-row ${colorClass}">
                <div style="font-weight:900;">${m.getAttribute("type").toUpperCase()}</div>
                <div style="font-size:10px;">Field ${m.getAttribute("fieldId")} | $${parseFloat(m.getAttribute("reward")).toLocaleString()}</div>
            </div>`;
    }).join('') || "NO CONTRACTS";
    document.querySelector(`#slot-${id}-missions .content`).innerHTML = html;
}

/**
 * BOX 3: FLEET & ASSETS [cite: 2026-02-13]
 */
function renderFleetDetailed(id, vml, iml) {
    const units = Array.from(vml.getElementsByTagName("vehicle")).filter(u => !u.getAttribute("filename").toUpperCase().includes('BALE'));
    
    const html = units.map(u => {
        const farmId = u.getAttribute("farmId") || "1";
        const colorClass = farmId === "1" ? "owner-kevin" : "owner-ray";
        const name = u.getAttribute("filename")?.split('/').pop().toUpperCase().replace('.XML', '');
        const wear = (parseFloat(u.getElementsByTagName("wearable")[0]?.getAttribute("damage") || 0) * 100).toFixed(0);

        return `
            <div class="item-row ${colorClass}">
                <strong>${name}</strong>
                <div style="font-size:10px; opacity:0.7;">OWNER: ${farmId === "1" ? 'KEVIN' : 'RAY'} | DMG: ${wear}%</div>
            </div>`;
    }).join('');
    document.querySelector(`#slot-${id}-fleet .content`).innerHTML = html;
}

async function fetchXML(url) {
    try {
        const res = await fetch(url + getTruthID());
        if (res.ok) return new DOMParser().parseFromString(await res.text(), "text/xml");
    } catch (e) { return null; }
}
