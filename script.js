/**
 * FS MASTER UNIFIED ENGINE v1.52
 * REPAIR: Node-Drilling for 0% Data, Clock Sync, and Module Routing.
 * MANDATE: Full Effect | Zero-Fake Policy [cite: 2026-01-26]
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";
const GPORTAL_FEED = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('saveSelector');
    // Initial Sync
    syncMasterMatrix(selector.value);
    
    // Global Listener for Slot Swapping
    selector.addEventListener('change', (e) => syncMasterMatrix(e.target.value));
    
    // 30-Second Continuous Sync [cite: 2026-02-08]
    setInterval(() => syncMasterMatrix(selector.value), 30000);
});

async function syncMasterMatrix(slot) {
    const gitPath = `${GITHUB_ROOT}/saved-game-${slot}`;
    const timestamp = Date.now(); // Prevents GitHub Cache-Lock
    
    document.getElementById('currentSlotLabel').textContent = `SLOT ${slot} ACTIVE`;
    
    await Promise.all([
        fetchLiveGPortal(GPORTAL_FEED),
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetDeep),
        fetchDeepXML(`${gitPath}/farms.xml`, parseFinancials),
        // Handshake with external .html blades
        triggerModuleSync(gitPath)
    ]);
}

/**
 * FIXED: Deep Node Parser
 * Resolves 0% data by finding nested FS22 telemetry nodes.
 */
function parseFleetDeep(xml) {
    const list = document.getElementById('fleetLog');
    if (!list) return;

    const units = Array.from(xml.getElementsByTagName("vehicle"));
    list.innerHTML = units.map(u => {
        const name = u.getAttribute("filename")?.split('/').pop().replace('.xml', '').toUpperCase() || "UNIT";
        
        // Deep Search: FS22 stores these in sub-nodes
        const fuelNode = u.getElementsByTagName("fuelConsumer")[0] || u.getElementsByTagName("consumer")[0];
        const wearNode = u.getElementsByTagName("wearable")[0] || u;
        
        // Normalizing: converts 0.43 -> 43%
        const fuel = (parseFloat(fuelNode?.getAttribute("fillLevel") || 0) * 100).toFixed(0);
        const wear = (parseFloat(wearNode?.getAttribute("damage") || 0) * 100).toFixed(0);
        const cargo = u.getElementsByTagName("fillUnit")[0]?.getAttribute("fillLevel") || 0;

        return `
            <div class="telemetry-row">
                <span>${name}</span>
                <span style="color:var(--gold)">${parseFloat(cargo).toFixed(0)}L</span>
                <div>
                    ${fuel}% FUEL <div class="bar-bg"><div class="bar-fill" style="width:${fuel}%; background:var(--fuel)"></div></div>
                    ${wear}% WEAR <div class="bar-bg"><div class="bar-fill" style="width:${wear}%; background:${wear > 50 ? 'var(--danger)' : 'var(--safe)'}"></div></div>
                </div>
            </div>`;
    }).join('');
}

async function triggerModuleSync(path) {
    // Forces external blades to update immediately on slot change
    if (typeof syncFieldBlade === "function") syncFieldBlade(path);
    if (typeof syncAnimalBlade === "function") syncAnimalBlade(path);
    if (typeof syncFactoryBlade === "function") syncFactoryBlade(path);
}

async function fetchLiveGPortal(url) {
    try {
        const res = await fetch(url + "?v=" + Date.now());
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        const server = xml.getElementsByTagName("Server")[0];
        
        if (server) {
            // Header: Map & Server Identity
            document.getElementById('mapDisplay').textContent = `Map: ${server.getAttribute('mapName')}`;
            document.getElementById('serverNameDisplay').textContent = server.getAttribute('name');

            // Clock: miliseconds to human-readable 09:03
            const rawTime = parseInt(server.getAttribute('dayTime'));
            const hours = Math.floor(rawTime / 3600000) % 24;
            const mins = Math.floor((rawTime % 3600000) / 60000);
            document.getElementById('gameClock').textContent = `Time: ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }
    } catch (e) { console.warn("Live feed check..."); }
}

function parseFinancials(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        if (f.getAttribute("farmId") === "1") document.getElementById('kevinFinance').textContent = money;
        if (f.getAttribute("farmId") === "2") document.getElementById('rayFinance').textContent = money;
    });
}

async function fetchDeepXML(url, parser) {
    try {
        const res = await fetch(url + "?v=" + Date.now());
        parser(new DOMParser().parseFromString(await res.text(), "text/xml"));
    } catch (e) { }
}
