/**
 * FS TOTAL TELEMETRY ENGINE v1.11
 * Mandate: Deep XML Parsing (Fuel, Damage, Crops, Animals)
 * Authors: werewolf3788 & raymystro
 */

const RAW_URL = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main/saved-game-5";

document.addEventListener('DOMContentLoaded', () => {
    syncFullDashboard();
    // Refresh every 5 minutes to stay accurate
    setInterval(syncFullDashboard, 300000); 
});

async function syncFullDashboard() {
    updateSystemStatus("Synchronizing Live Data...");
    
    await Promise.all([
        fetchXML(`${RAW_URL}/farms.xml`, parseFarms),
        fetchXML(`${RAW_URL}/vehicles.xml`, parseVehicles),
        fetchXML(`${RAW_URL}/fields.xml`, parseFields),
        fetchXML(`${RAW_URL}/careerSavegame.xml`, parseGlobal),
        fetchXML(`${RAW_URL}/players.xml`, parseTeam),
        fetchXML(`${RAW_URL}/placeables.xml`, parseInfra),
        fetchXML(`${RAW_URL}/precisionFarming.xml`, parseSoil)
    ]);

    updateSystemStatus("System Synchronized");
}

async function fetchXML(url, parser) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("404");
        const text = await res.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        parser(xml);
    } catch (e) { console.warn(`N/A for: ${url}`); }
}

function parseFarms(xml) {
    const farms = xml.getElementsByTagName("farm");
    for (let i = 0; i < 2; i++) {
        const container = document.getElementById(`farm${i+1}Stats`);
        if (farms[i]) {
            const money = parseInt(farms[i].getAttribute("money")).toLocaleString();
            const name = farms[i].getAttribute("name") || `Operations ${i+1}`;
            container.innerHTML = `<div class="telemetry-row"><span>${name}</span> <strong style="color:var(--safe)">$${money}</strong></div>`;
        } else { container.innerHTML = "N/A - Slot Inactive"; }
    }
}

function parseVehicles(xml) {
    const list = document.getElementById('fleetLog');
    const units = xml.getElementsByTagName("vehicle");
    let html = "";

    for (let u of units) {
        const name = u.getAttribute("filename").split('/').pop().replace('.xml', '');
        const fuel = parseFloat(u.getElementsByTagName("fuelConsumer")[0]?.getAttribute("fillLevel") || 0).toFixed(0);
        const damage = (parseFloat(u.getAttribute("damage") || 0) * 100).toFixed(0);
        
        html += `
            <div class="telemetry-row">
                <span>${name.toUpperCase()}</span>
                <div>${fuel}% <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${fuel}%; background:var(--fuel)"></div></div></div>
                <div>${damage}% <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${damage}%; background:${damage > 50 ? 'var(--danger)' : 'var(--warn)'}"></div></div></div>
            </div>`;
    }
    list.innerHTML = html || "No Units Detected";
}

function parseFields(xml) {
    const list = document.getElementById('fieldLog');
    const fields = xml.getElementsByTagName("field");
    let html = "";

    for (let f of fields) {
        const id = f.getAttribute("fieldId");
        const fruit = f.getAttribute("fruitType") || "Fallow";
        html += `
            <div class="telemetry-row">
                <span>FIELD ${id}</span>
                <span style="color:var(--farm-gold)">${fruit.toUpperCase()}</span>
                <span style="color:var(--safe)">Growth Active</span>
            </div>`;
    }
    list.innerHTML = html || "No Active Crops Detected";
}

function parseSoil(xml) {
    const fields = xml.getElementsByTagName("field");
    document.getElementById('soilLog').innerHTML = `<div class="telemetry-row"><span>Analyzed Fields:</span> <strong>${fields.length}</strong></div><div class="telemetry-row"><span>Soil State:</span> <strong>SYNCED</strong></div>`;
}

function parseInfra(xml) {
    const list = document.getElementById('infraLog');
    const items = xml.getElementsByTagName("placeable");
    let html = "";
    for (let i of items) {
        const name = i.getAttribute("filename").split('/').pop().replace('.xml', '');
        html += `<div class="telemetry-row"><span>🏗️ ${name}</span> <span>Operational</span></div>`;
    }
    list.innerHTML = html;
}

function parseGlobal(xml) {
    const time = xml.getElementsByTagName("dayTime")[0]?.textContent || 0;
    const hours = Math.floor(time / 3600000);
    const min = Math.floor((time % 3600000) / 60000);
    document.getElementById('gameClock').textContent = `Time: ${hours}:${min.toString().padStart(2, '0')}`;
}

function parseTeam(xml) {
    const names = Array.from(xml.getElementsByTagName("player")).map(p => p.getAttribute("name")).join(" & ");
    document.getElementById('activeTeam').textContent = `Team: ${names || 'werewolf3788 & raymystro'}`;
}

function updateSystemStatus(msg) {
    document.getElementById('systemStatus').textContent = `● ${msg}`;
}
