/**
 * FS MASTER UNIFIED ENGINE v2.17 - LIVE-MAP SYNC
 * REPAIR: Maps "Big Flats Texas" to Slot 2 and highlights LIVE status in dropdown.
 * MANDATE: Full Detail | Zero Snippets | Zero-Fake Policy [cite: 2026-01-26]
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";
const GPORTAL_FEED = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";
const getTruthID = () => `?truth=${Date.now()}`;

// Map Name to Slot ID Configuration [cite: 2026-02-13]
const SLOT_MAP = {
    "Big Flats Texas": 2,
    "Land of Italy": 5 // Example for Missouri slot
};

document.addEventListener('DOMContentLoaded', async () => {
    const selector = document.getElementById('slotSelector');
    
    // 1. Initial G-Portal Scan [cite: 2026-02-12]
    const liveMap = await fetchLiveMapStatus();
    const liveSlot = SLOT_MAP[liveMap] || 2; // Default to Slot 2 if unknown

    // 2. Populate Dropdown with Live Logic
    for (let i = 1; i <= 20; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        let label = `SAVE SLOT ${i}`;
        if (i === 2) label += " (TEXAS)";
        if (i === 5) label += " (MISSOURI)";
        if (i === liveSlot) label += " - [LIVE ON SERVER]";
        
        opt.innerText = label;
        selector.appendChild(opt);
    }

    selector.value = liveSlot;
    syncData(liveSlot);

    selector.addEventListener('change', (e) => syncData(e.target.value));
    setInterval(async () => {
        const updatedMap = await fetchLiveMapStatus();
        updateLiveBadge(updatedMap);
    }, 60000);
});

async function fetchLiveMapStatus() {
    try {
        const res = await fetch(GPORTAL_FEED + getTruthID());
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        const server = xml.getElementsByTagName("Server")[0];
        return server ? server.getAttribute('mapName') : "Unknown";
    } catch (e) { return "Unknown"; }
}

function updateLiveBadge(mapName) {
    const badge = document.getElementById('liveBadge');
    badge.innerHTML = `SERVER LIVE: <span class="live-pulse">${mapName.toUpperCase()}</span>`;
}

async function syncData(slotId) {
    const path = `${GITHUB_ROOT}/saved-game-${slotId}`;
    document.getElementById('activeSlotTitle').innerText = `DRILLING DATA: SLOT ${slotId}`;
    
    const [fml, pre, mis, vml, iml] = await Promise.all([
        fetchXML(`${path}/farmland.xml`), fetchXML(`${path}/precisionFarming.xml`),
        fetchXML(`${path}/missions.xml`), fetchXML(`${path}/vehicles.xml`), fetchXML(`${path}/items.xml`)
    ]);

    if (fml) renderFarmland(fml, pre);
    if (mis) renderMissions(mis);
    if (vml) renderFleet(vml, iml);
}

function renderFarmland(fml, pre) {
    const lands = Array.from(fml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") !== "0");
    const pNodes = Array.from(pre?.getElementsByTagName("field") || []);
    document.querySelector(`#active-farmland .content`).innerHTML = lands.map(l => {
        const farmId = l.getAttribute("farmId");
        const color = farmId === "1" ? "owner-kevin" : "owner-ray";
        const p = pNodes.find(n => n.getAttribute("id") === l.getAttribute("id"));
        return `<div class="item-row ${color}">
            <strong style="color:${farmId === "1" ? 'var(--kevin-orange)' : 'var(--ray-red)'}">FIELD ${l.getAttribute("id")}</strong>
            <div style="font-size:11px; opacity:0.7;">pH: ${parseFloat(p?.getAttribute("phValue") || 0).toFixed(1)} | N: ${parseFloat(p?.getAttribute("nitrogenValue") || 0).toFixed(0)}kg</div>
        </div>`;
    }).join('') || "NO DATA";
}

function renderMissions(xml) {
    const active = Array.from(xml.getElementsByTagName("mission")).filter(m => m.getAttribute("status") === "1");
    document.querySelector(`#active-missions .content`).innerHTML = active.map(m => {
        const farmId = m.getAttribute("farmId");
        const color = farmId === "1" ? "owner-kevin" : "owner-ray";
        return `<div class="item-row ${color}">
            <strong style="color:${farmId === "1" ? 'var(--kevin-orange)' : 'var(--ray-red)'}">${m.getAttribute("type").toUpperCase()}</strong>
            <div style="font-size:11px;">Field ${m.getAttribute("fieldId")} | $${parseFloat(m.getAttribute("reward")).toLocaleString()}</div>
        </div>`;
    }).join('') || "NO CONTRACTS";
}

function renderFleet(vml, iml) {
    const units = Array.from(vml.getElementsByTagName("vehicle")).filter(u => !u.getAttribute("filename").toUpperCase().includes('BALE'));
    document.querySelector(`#active-fleet .content`).innerHTML = units.map(u => {
        const farmId = u.getAttribute("farmId") || "1";
        const color = farmId === "1" ? "owner-kevin" : "owner-ray";
        return `<div class="item-row ${color}">
            <strong style="color:${farmId === "1" ? 'var(--kevin-orange)' : 'var(--ray-red)'}">${u.getAttribute("filename").split('/').pop().toUpperCase()}</strong>
            <div style="font-size:11px; opacity:0.6;">Damage: ${(parseFloat(u.getElementsByTagName("wearable")[0]?.getAttribute("damage") || 0) * 100).toFixed(0)}%</div>
        </div>`;
    }).join('') || "NO UNITS";
}

async function fetchXML(url) {
    try {
        const res = await fetch(url + getTruthID());
        return res.ok ? new DOMParser().parseFromString(await res.text(), "text/xml") : null;
    } catch (e) { return null; }
}
