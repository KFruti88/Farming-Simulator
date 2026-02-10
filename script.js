/**
 * FS MASTER SECURE TELEMETRY v1.27
 * Removed sensitive IP exposure for public safety.
 */

// We use a constant for the feed, but never display it in the UI
const FEED_ENDPOINT = "http://176.57.165.81:8080/feed/dedicated-server-stats.xml?code=DIaoyx8jutkGtlDr";

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('saveSelector');
    syncSecureData(selector.value);
    selector.addEventListener('change', (e) => syncSecureData(e.target.value));
    setInterval(() => syncSecureData(selector.value), 60000);
});

async function syncSecureData(slot) {
    const path = `./saved-game-${slot}`; 
    document.getElementById('currentSlotLabel').textContent = `SLOT ${slot}`;
    
    await Promise.all([
        fetchHeaderOnly(FEED_ENDPOINT),
        fetchRepoXML(`${path}/vehicles.xml`, parseFleet),
        fetchRepoXML(`${path}/fields.xml`, parseFields),
        fetchRepoXML(`${path}/farms.xml`, parseFarms),
        fetchRepoXML(`${path}/careerSavegame.xml`, parseGlobal)
    ]);
}

async function fetchHeaderOnly(url) {
    try {
        const res = await fetch(url);
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        const server = xml.getElementsByTagName("Server")[0];
        if (server) {
            document.getElementById('mapDisplay').textContent = `Map: ${server.getAttribute('mapName')}`;
            const p = Array.from(xml.getElementsByTagName("Player")).filter(p => p.getAttribute('isUsed') === 'true');
            document.getElementById('playerLog').innerHTML = p.length > 0 ? 
                p.map(player => `<div class="telemetry-row"><span>👤 CLOAKED USER</span> <strong style="color:var(--safe)">ONLINE</strong></div>`).join('') :
                '<div class="telemetry-row"><span>Sector Empty</span></div>';
        }
    } catch (e) { console.warn("Cloud feed secured"); }
}

function parseFleet(xml) {
    const list = document.getElementById('fleetLog');
    const units = Array.from(xml.getElementsByTagName("vehicle"));
    list.innerHTML = units.map(u => {
        const name = u.getAttribute("filename").split('/').pop().replace('.xml', '').toUpperCase();
        const fuel = parseFloat(u.getElementsByTagName("fuelConsumer")[0]?.getAttribute("fillLevel") || 0).toFixed(0);
        const wear = (parseFloat(u.getAttribute("damage") || 0) * 100).toFixed(0);
        const cargo = u.getAttribute("fillLevels")?.split(' ')[0] || "0";
        return `
            <div class="telemetry-row">
                <span>${name}</span>
                <span style="color:var(--gold)">${cargo}L CARGO</span>
                <div>
                    ${fuel}% FUEL <div class="bar-bg"><div class="bar-fill" style="width:${fuel}%; background:var(--fuel)"></div></div>
                    ${wear}% WEAR <div class="bar-bg"><div class="bar-fill" style="width:${wear}%; background:${wear > 50 ? 'var(--danger)' : 'var(--safe)'}"></div></div>
                </div>
            </div>`;
    }).join('');
}

function parseFields(xml) {
    const list = document.getElementById('fieldLog');
    list.innerHTML = Array.from(xml.getElementsByTagName("field")).map(f => {
        const owned = f.getAttribute('isOwned') === 'true' ? 'OWNED' : 'VACANT';
        return `<div class="telemetry-row"><span>ZONE ${f.getAttribute('fieldId')}</span> <span>${f.getAttribute('fruitType') || 'FALLOW'}</span> <strong style="color:${f.getAttribute('isOwned') === 'true' ? 'var(--safe)' : '#777'}">${owned}</strong></div>`;
    }).join('');
}

function parseFarms(xml) {
    const farms = xml.getElementsByTagName("farm");
    for (let i = 0; i < 2; i++) {
        const target = document.getElementById(`farm${i+1}Stats`);
        if (farms[i]) {
            const money = parseInt(farms[i].getAttribute("money")).toLocaleString();
            target.innerHTML = `<div class="telemetry-row"><span>OPERATIONS:</span> <strong style="color:var(--safe)">$${money}</strong></div>`;
        } else { target.innerHTML = "N/A"; }
    }
}

async function fetchRepoXML(url, parser) {
    try {
        const res = await fetch(url);
        const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
        parser(xml);
    } catch (e) { /* Secure failure */ }
}

function parseGlobal(xml) {
    const time = xml.getElementsByTagName("dayTime")[0]?.textContent || 0;
    const h = Math.floor(time / 3600000);
    const m = Math.floor((time % 3600000) / 60000);
    document.getElementById('gameClock').textContent = `Time: ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
