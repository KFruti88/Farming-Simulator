/**
 * FS MASTER TELEMETRY v1.37
 * FULL MATRIX: Animals, Field Growth, and Total Fleet.
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";
const GPORTAL_STATS = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('saveSelector');
    syncFullMatrix(selector.value);
    selector.addEventListener('change', (e) => syncFullMatrix(e.target.value));
    setInterval(() => syncFullMatrix(selector.value), 30000);
});

async function syncFullMatrix(slot) {
    const gitPath = `${GITHUB_ROOT}/saved-game-${slot}`;
    document.getElementById('currentSlotLabel').textContent = `SLOT ${slot}`;
    
    await Promise.all([
        fetchLiveTelemetry(GPORTAL_STATS),
        fetchDeepXML(`${gitPath}/animals.xml`, parseAnimalsMatrix),
        fetchDeepXML(`${gitPath}/fields.xml`, parseFieldsMatrix),
        fetchDeepXML(`${gitPath}/vehicles.xml`, parseFleetMatrix),
        fetchDeepXML(`${gitPath}/farms.xml`, parseFarmsMatrix)
    ]);
}

/** * 1. ANIMAL BIOMETRICS
 */
function parseAnimalsMatrix(xml) {
    const list = document.getElementById('animalLog');
    const animals = Array.from(xml.getElementsByTagName("animal"));
    
    list.innerHTML = animals.map(a => {
        const type = a.getAttribute("type") || "Livestock";
        const health = (parseFloat(a.getAttribute("health") || 0)).toFixed(0);
        const age = a.getAttribute("age") || 0;
        const food = (parseFloat(a.getAttribute("foodLevel") || 0)).toFixed(0);

        return `<div class="telemetry-row">
            <span>${type.split('_').pop().toUpperCase()}</span>
            <div>
                ${health}% Health <div class="bar-bg"><div class="bar-fill" style="width:${health}%; background:var(--safe)"></div></div>
            </div>
            <span>Age: ${age}m / Food: ${food}L</span>
        </div>`;
    }).join('') || "No Animals Found";
}

/** * 2. FIELD GROWTH & HARVEST
 */
function parseFieldsMatrix(xml) {
    const list = document.getElementById('fieldLog');
    const fields = Array.from(xml.getElementsByTagName("field"));
    
    list.innerHTML = fields.map(f => {
        const id = f.getAttribute("id") || f.getAttribute("fieldId");
        const crop = (f.getAttribute("fruitType") || "FALLOW").toUpperCase();
        // Growth Stage 6-7 is usually harvest-ready in FS22
        const stage = parseInt(f.getAttribute("growthState") || 0);
        const owner = f.getAttribute("owner") === "2" ? "RAY" : "KEVIN";
        const isReady = stage >= 6;

        return `<div class="telemetry-row">
            <span>ZONE ${id}</span>
            <span>${crop}</span>
            <div style="display:flex; flex-direction:column; gap:4px;">
                <span style="color:${isReady?'var(--safe)':'#999'}">${isReady ? 'READY TO HARVEST' : 'GROWING'}</span>
                <span style="font-size:0.7rem; color:#666">Owner: ${owner}</span>
            </div>
        </div>`;
    }).join('') || "No Field Data Detected";
}

/** * 3. TOTAL FLEET [cite: 2026-02-08]
 */
function parseFleetMatrix(xml) {
    const list = document.getElementById('fleetLog');
    const units = Array.from(xml.getElementsByTagName("vehicle"));
    list.innerHTML = units.map(u => {
        const name = u.getAttribute("filename")?.split('/').pop().replace('.xml', '').toUpperCase() || "UNIT";
        const wear = (parseFloat(u.getElementsByTagName("wearable")[0]?.getAttribute("damage") || 0) * 100).toFixed(0);
        const fuel = (parseFloat(u.getElementsByTagName("fuelConsumer")[0]?.getAttribute("fillLevel") || 0) * 100).toFixed(0);
        const cargo = u.getElementsByTagName("fillUnit")[0]?.getAttribute("fillLevel") || 0;

        return `<div class="telemetry-row">
            <span>${name}</span>
            <span>${parseFloat(cargo).toFixed(0)}L</span>
            <div>
                ${fuel}% Fuel <div class="bar-bg"><div class="bar-fill" style="width:${fuel}%; background:var(--fuel)"></div></div>
                ${wear}% Wear <div class="bar-bg"><div class="bar-fill" style="width:${wear}%; background:${wear > 50 ? 'var(--danger)' : 'var(--safe)'}"></div></div>
            </div>
        </div>`;
    }).join('');
}

function parseFarmsMatrix(xml) {
    Array.from(xml.getElementsByTagName("farm")).forEach(f => {
        const money = `$${parseInt(f.getAttribute("money")).toLocaleString()}`;
        if (f.getAttribute("farmId") === "1") document.getElementById('kevinFinance').textContent = money;
        if (f.getAttribute("farmId") === "2") document.getElementById('rayFinance').textContent = money;
    });
}

async function fetchLiveTelemetry(url) {
    try {
        const res = await fetch(url);
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        const server = xml.getElementsByTagName("Server")[0];
        if (server) {
            document.getElementById('mapDisplay').textContent = `Map: ${server.getAttribute('mapName')}`;
            document.getElementById('serverNameDisplay').textContent = server.getAttribute('name');
            const rawTime = parseInt(server.getAttribute('dayTime'));
            const hours = Math.floor(rawTime / 3600000) % 24;
            const mins = Math.floor((rawTime % 3600000) / 60000);
            document.getElementById('gameClock').textContent = `Time: ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            const players = Array.from(xml.getElementsByTagName("Player")).filter(p => p.getAttribute('isUsed') === 'true');
            document.getElementById('playerLog').innerHTML = players.map(p => `<div class="telemetry-row"><span>👤 ${p.textContent}</span> <strong style="color:var(--safe)">ONLINE</strong></div>`).join('') || "No Players Online";
        }
    } catch (e) { console.warn("Live feed check..."); }
}

async function fetchDeepXML(url, parser) {
    try {
        const res = await fetch(url);
        parser(new DOMParser().parseFromString(await res.text(), "text/xml"));
    } catch (e) { /* Error Handling */ }
}
