/**
 * FS MASTER UNIFIED ENGINE v1.71 - DEFINITIVE PRODUCTION
 * REPAIR: Resolved Module Injection, 0% Node-Drilling, and Cache-Lock.
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
    
    // Initial Sequence: Hydrate -> Load Modules -> Sync XML [cite: 2026-01-26]
    hydrateDashboardFromCache();
    initializeMasterCycle(selector.value);
    
    selector.addEventListener('change', (e) => {
        localStorage.clear(); 
        initializeMasterCycle(e.target.value);
    });
    
    // 30-Second Continuous Truth Pulse [cite: 2026-02-08]
    setInterval(() => initializeMasterCycle(selector.value), 30000);
});

async function initializeMasterCycle(slot) {
    const gitPath = `${GITHUB_ROOT}/saved-game-${slot}`;
    document.getElementById('currentSlotLabel').textContent = `SLOT ${slot} ACTIVE`;
    
    // Parallel Execution: HTML Injection + XML Telemetry [cite: 2026-01-26]
    await Promise.all([
        fetchLiveGPortal(GPORTAL_FEED),
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetHardDrill, "fleetLog"),
        fetchDeepXML(`${gitPath}/farms.xml`, parseFinancials, "farmData"),
        injectExternalModules(gitPath) // Pulls the .html codes into the index [cite: 2026-01-26]
    ]);
}

/**
 * DYNAMIC MODULE INJECTION [cite: 2026-01-26]
 * Reads your html files and wakes up their sync functions.
 */
async function injectExternalModules(gitPath) {
    const truthID = getTruthID();
    const modules = [
        { id: 'module-1-field-info', file: 'field-info.html', sync: 'syncFieldBlade' },
        { id: 'module-2-animal-info', file: 'animal-info.html', sync: 'syncAnimalBlade' },
        { id: 'module-3-factory-info', file: 'factory-info.html', sync: 'syncFactoryBlade' }
    ];

    for (const mod of modules) {
        try {
            const res = await fetch(`${mod.file}${truthID}`);
            if (res.ok) {
                const html = await res.text();
                const container = document.getElementById(mod.id);
                if (container) {
                    container.innerHTML = html;
                    // Critical Handshake: Wakes up the logic inside the injected file [cite: 2026-02-10]
                    if (typeof window[mod.sync] === "function") {
                        window[mod.sync](gitPath);
                    }
                }
            }
        } catch (e) { console.warn(`Module ${mod.file} failed to seat.`); }
    }
}

function hydrateDashboardFromCache() {
    ['kevinFinance', 'rayFinance', 'playerLog', 'fleetLog', 'mapDisplay', 'gameClock'].forEach(key => {
        const val = localStorage.getItem(key);
        if (val && document.getElementById(key)) document.getElementById(key).innerHTML = val;
    });
}

function updatePersistentElement(id, content) {
    const element = document.getElementById(id);
    if (element && element.innerHTML !== content) {
        element.innerHTML = content;
        localStorage.setItem(id, content);
    }
}

/**
 * HARD-DRILL PARSER: Fixes 0% Telemetry [cite: 2026-02-08, 2026-02-10]
 */
function parseFleetHardDrill(xml) {
    const list = document.getElementById('fleetLog');
    if (!list) return;

    const units = Array.from(xml.getElementsByTagName("vehicle"));
    const fleetHTML = units.map(u => {
        const name = u.getAttribute("filename")?.split('/').pop().replace('.xml', '').toUpperCase() || "UNIT";
        const fuelNode = u.getElementsByTagName("fuelConsumer")[0] || u.getElementsByTagName("consumer")[0];
        const wearNode = u.getElementsByTagName("wearable")[0] || u;
        
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

    updatePersistentElement('fleetLog', fleetHTML);
}

/**
 * G-PORTAL LIVE SYNC [cite: 2026-02-08, 2026-02-10]
 * NOTE: If Map/Clock stay at 09:03, allow "Insecure Content" in your browser bar.
 */
async function fetchLiveGPortal(url) {
    try {
        const res = await fetch(url + getTruthID());
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        const server = xml.getElementsByTagName("Server")[0];
        
        if (server) {
            updatePersistentElement('mapDisplay', `Map: ${server.getAttribute('mapName')}`);
            const rawTime = parseInt(server.getAttribute('dayTime'));
            const hours = Math.floor(rawTime / 3600000) % 24;
            const mins = Math.floor((rawTime % 3600000) / 60000);
            updatePersistentElement('gameClock', `Time: ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);

            const players = Array.from(xml.getElementsByTagName("Player")).filter(p => p.getAttribute('isUsed') === 'true');
            const playerHTML = players.map(p => `
                <div class="telemetry-row">👤 ${p.textContent} <strong style="color:var(--safe)">ONLINE</strong></div>
            `).join('') || "Sector Empty";
            updatePersistentElement('playerLog', playerHTML);
        }
    } catch (e) { console.warn("Live Link Attempted..."); }
}

function parseFinancials(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        // werewolf3788 (Farm 1) | raymystro (Farm 2) [cite: 2026-01-27]
        if (f.getAttribute("farmId") === "1") updatePersistentElement('kevinFinance', money);
        if (f.getAttribute("farmId") === "2") updatePersistentElement('rayFinance', money);
    });
}

async function fetchDeepXML(url, parser) {
    try {
        const res = await fetch(url + getTruthID());
        if (res.ok) parser(new DOMParser().parseFromString(await res.text(), "text/xml"));
    } catch (e) { }
}
