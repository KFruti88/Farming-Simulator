/**
 * Farming Simulator XML Data Parser
 * Mandate: Hyper-Realism & Accuracy
 * Description: Fetches real-world XML data from GitHub and parses it into the UI.
 */

const GITHUB_BASE = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";

// Configuration for Global XML files
const globalFiles = {
    settings: `${GITHUB_BASE}/gameSettings.xml`,
    game: `${GITHUB_BASE}/game.xml`,
    extra: `${GITHUB_BASE}/extraContent.xml`,
    server: `${GITHUB_BASE}/dedicated_server.xml`
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    fetchAllData();

    // Event Listener for Saved Game Selection
    const saveSelector = document.getElementById('saveSelector');
    saveSelector.addEventListener('change', (e) => {
        fetchSavegameData(e.target.value);
    });
});

/**
 * Main function to fetch all global configurations
 */
async function fetchAllData() {
    updateStatus("Fetching Global Data...");
    
    await Promise.all([
        fetchAndDisplay(globalFiles.settings, 'gameSettingsData', parseSettings),
        fetchAndDisplay(globalFiles.server, 'serverData', parseServer),
        fetchAndDisplay(globalFiles.extra, 'extraContentData', parseExtra)
    ]);

    // Default load for the initially selected save game
    const currentSave = document.getElementById('saveSelector').value;
    fetchSavegameData(currentSave);
    
    updateStatus("System Synchronized");
}

/**
 * Fetches data specific to the saved-game-X directories
 */
async function fetchSavegameData(saveNumber) {
    const savePath = `${GITHUB_BASE}/saved-game-${saveNumber}/careerSavegame.xml`;
    const farmsPath = `${GITHUB_BASE}/saved-game-${saveNumber}/farms.xml`;
    
    const container = document.getElementById('savegameData');
    container.innerHTML = `<div class="loading">Accessing saved-game-${saveNumber}...</div>`;

    try {
        const response = await fetch(savePath);
        if (!response.ok) throw new Error("File not found");
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        // Extracting specific Career Data
        const saveName = xmlDoc.getElementsByTagName("savegameName")[0]?.textContent || "Unnamed Farm";
        const money = xmlDoc.getElementsByTagName("money")[0]?.textContent || "N/A";
        const mapName = xmlDoc.getElementsByTagName("mapId")[0]?.textContent || "N/A";
        const playtime = xmlDoc.getElementsByTagName("playTime")[0]?.textContent || "0";

        container.innerHTML = `
            <div class="data-item"><span class="data-label">Farm Name:</span> <span>${saveName}</span></div>
            <div class="data-item"><span class="data-label">Current Balance:</span> <span>$${Math.floor(money).toLocaleString()}</span></div>
            <div class="data-item"><span class="data-label">Map:</span> <span>${mapName}</span></div>
            <div class="data-item"><span class="data-label">Play Time:</span> <span>${(playtime / 60).toFixed(2)} Hours</span></div>
        `;
    } catch (error) {
        container.innerHTML = `<div class="error">Data unavailable for Slot ${saveNumber}. (N/A)</div>`;
    }
}

/**
 * Utility to fetch and route XML parsing
 */
async function fetchAndDisplay(url, elementId, parserFunc) {
    const display = document.getElementById(elementId);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response error");
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        display.innerHTML = parserFunc(xmlDoc);
    } catch (error) {
        display.innerHTML = `<div class="error">N/A - Check Repository Path</div>`;
    }
}

/**
 * XML Parsers for specific file structures
 */
function parseSettings(xml) {
    const language = xml.getElementsByTagName("language")[0]?.textContent || "English";
    const joystick = xml.getElementsByTagName("joystickHelp")[0]?.textContent || "N/A";
    return `
        <div class="data-item"><span class="data-label">Language:</span> <span>${language}</span></div>
        <div class="data-item"><span class="data-label">Joystick Help:</span> <span>${joystick}</span></div>
    `;
}

function parseServer(xml) {
    const port = xml.getElementsByTagName("port")[0]?.textContent || "N/A";
    const players = xml.getElementsByTagName("max_players")[0]?.textContent || "N/A";
    return `
        <div class="data-item"><span class="data-label">Server Port:</span> <span>${port}</span></div>
        <div class="data-item"><span class="data-label">Max Players:</span> <span>${players}</span></div>
    `;
}

function parseExtra(xml) {
    // Lists the first 3 mods/DLCs found
    const items = xml.getElementsByTagName("item");
    let html = "";
    for (let i = 0; i < Math.min(items.length, 4); i++) {
        const title = items[i].getAttribute("title") || "Unknown Content";
        html += `<div class="data-item"><span>${title}</span></div>`;
    }
    return html || "No extra content detected.";
}

function updateStatus(msg) {
    document.getElementById('statusIndicator').textContent = `System Status: ${msg}`;
}
