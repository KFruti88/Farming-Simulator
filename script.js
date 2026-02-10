/**
 * FS HYBRID MASTER COMMAND v1.16
 * Image Integration: Scans Saved Game folders for png/jpg/jpeg
 * Priority: G-Portal Live Feed
 */

const GPORTAL_STATS = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";
const GPORTAL_ECON = "http://176.57.165.81:8080/feed/dedicated-server-savegame.html?code=DIaoyx8jutkGtlDr&file=economy";
const GITHUB_RAW = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";

document.addEventListener('DOMContentLoaded', () => {
    const saveSelector = document.getElementById('saveSelector');
    
    // Initial Sync
    syncFullDashboard(saveSelector.value);

    // Dynamic Slot Transition
    saveSelector.addEventListener('change', (e) => syncFullDashboard(e.target.value));
    
    // Refresh Logic (60s)
    setInterval(() => syncFullDashboard(saveSelector.value), 60000);
});

async function syncFullDashboard(slot) {
    const gitPath = `${GITHUB_RAW}/saved-game-${slot}`;
    document.getElementById('currentSlotLabel').textContent = `SLOT ${slot}`;
    
    await Promise.all([
        // DYNAMIC IMAGE FETCH
        updateSlotImage(slot),
        
        // G-PORTAL DIRECT (Priority 1)
        fetchDirectXML(GPORTAL_STATS, parseLiveServer),
        fetchDirectHTML(GPORTAL_ECON, 'liveEconomy'),
        
        // GITHUB REPO (Priority 2)
        fetchGitXML(`${gitPath}/vehicles.xml`, parseVehicles),
        fetchGitXML(`${gitPath}/fields.xml`, parseFields),
        fetchGitXML(`${gitPath}/placeables.xml`, parseInfra),
        fetchGitXML(`${gitPath}/careerSavegame.xml`, parseGlobal),
        fetchGitXML(`${gitPath}/players.xml`, parseTeam),
        fetchGitXML(`${gitPath}/animals.xml`, parseAnimals)
    ]);
}

/**
 * IMAGE LOGIC: Attempts to find an image in the current slot folder
 */
async function updateSlotImage(slot) {
    const extensions = ['jpg', 'png', 'jpeg'];
    const imgElement = document.getElementById('activeSlotImage');
    const folderPath = `${GITHUB_RAW}/saved-game-${slot}`;

    // Based on User Input, we check for images. 
    // Since we don't have the exact name, we search for common patterns or the map image
    for (let ext of extensions) {
        let testUrl = `${folderPath}/preview.${ext}`; 
        // We also check for the map image specifically if uploaded
        if (slot === "5") testUrl = `${folderPath}/alma-2C-missouri-us-v1.0.0.3-fs22-1.jpg`;

        try {
            const res = await fetch(testUrl, { method: 'HEAD' });
            if (res.ok) {
                imgElement.src = testUrl;
                return;
            }
        } catch (e) { /* Continue to next extension */ }
    }
}

async function fetchDirectXML(url, parser) {
    try {
        const res = await fetch(url);
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        parser(xml);
    } catch (e) { console.warn("Live Server Feed N/A"); }
}

async function fetchDirectHTML(url, elementId) {
    try {
        const res = await fetch(url);
        document.getElementById(elementId).innerHTML = await res.text();
    } catch (e) { document.getElementById(elementId).innerHTML = "G-Portal Feed Offline"; }
}

async function fetchGitXML(url, parser) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        parser(xml);
    } catch (e) { console.warn(`GitHub File N/A: ${url}`); }
}

/* --- PARSERS --- */

function parseLiveServer(xml) {
    const server = xml.getElementsByTagName("Server")[0];
    if (server) {
        document.getElementById('serverName').textContent = `Server: ${server.getAttribute('name')}`;
        document.getElementById('liveServerStats').innerHTML = `
            <div class="telemetry-row"><span>Status:</span> <strong style="color:var(--safe)">ONLINE</strong></div>
            <div class="telemetry-row"><span>Players:</span> <strong>${server.getAttribute('numPlayers')}/${server.getAttribute('capacity')}</strong></div>
            <div class="telemetry-row"><span>Map Name:</span> <strong>${server.getAttribute('mapName')}</strong></div>
        `;
    }
}

function parseVehicles(xml) {
    const list = document.getElementById('fleetLog');
    const units = xml.getElementsByTagName("vehicle");
    let html = "";
    for (let u of units) {
        const name = u.getAttribute("filename").split('/').pop().replace('.xml', '').toUpperCase();
        const fuel = parseFloat(u.getElementsByTagName("fuelConsumer")[0]?.getAttribute("fillLevel") || 0).toFixed(0);
        const damage = (parseFloat(u.getAttribute("damage") || 0) * 100).toFixed(0);
        html += `
            <div class="telemetry-row">
                <span>${name}</span>
                <div>${fuel}% <div class="bar-bg"><div class="bar-fill" style="width:${fuel}%; background:var(--fuel)"></div></div></div>
                <div>${damage}% <div class="bar-bg"><div class="bar-fill" style="width:${damage}%; background:${damage > 50 ? 'var(--danger)' : 'var(--warn)'}"></div></div></div>
            </div>`;
    }
    list.innerHTML = html || "No Fleet Data Found";
}

function parseFields(xml) {
    const list = document.getElementById('fieldLog');
    const fields = xml.getElementsByTagName("field");
    let html = "";
    for (let f of fields) {
        const id = f.getAttribute("fieldId");
        const fruit = (f.getAttribute("fruitType") || "FALLOW").toUpperCase();
        html += `<div class="telemetry-row"><span>FIELD ${id}</span> <span style="color:var(--gold)">${fruit}</span> <span style="color:var(--safe)">GROWTH</span></div>`;
    }
    list.innerHTML = html || "No Field Data Found";
}

function parseGlobal(xml) {
    const time = xml.getElementsByTagName("dayTime")[0]?.textContent || 0;
    const hours = Math.floor(time / 3600000);
    const min = Math.floor((time % 3600000) / 60000);
    document.getElementById('gameClock').textContent = `Time: ${hours.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

function parseTeam(xml) {
    const names = Array.from(xml.getElementsByTagName("player")).map(p => p.getAttribute("name")).join(" & ");
    document.getElementById('activeTeam').textContent = `Team: ${names || 'werewolf3788 & raymystro'}`;
}

function parseInfra(xml) {
    const list = document.getElementById('infraLog');
    const items = xml.getElementsByTagName("placeable");
    let html = "";
    for (let i of items) {
        const name = i.getAttribute("filename").split('/').pop().replace('.xml', '').toUpperCase();
        html += `<div class="telemetry-row"><span>🏗️ ${name}</span> <span>OPERATIONAL</span></div>`;
    }
    list.innerHTML = html;
}

function parseAnimals(xml) {
    const total = xml.getElementsByTagName("animal").length;
    document.getElementById('animalLog').innerHTML = `<div class="telemetry-row"><span>Live Count:</span> <strong>${total} Units</strong></div>`;
}
