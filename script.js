/**
 * 618 STRATEGIC ENGINE v2.30 - THE "NO KG" ULTIMATUM
 * REPAIR: Strips all metric units. Converts Nitrogen to lbs/ac.
 * MANDATE: Full Detail | No Snippets | Zero-Fake Policy [cite: 2026-01-26]
 */

const GITHUB_ROOT = "https://raw.githubusercontent.com/KFruti88/Farming-Simulator/main";

// HUMAN-READABLE DICTIONARY [cite: 2026-02-13]
const TRANSLATION = {
    "STUBBLE": "HARVESTED (READY FOR WORK)",
    "GRASS": "GRASS (READY TO CUT)",
    "LIQUIDMANURE": "SLURRY",
    "DIGESTATE": "FERTILIZER"
};

async function updatePrecision(fml, pre, fld) {
    const owned1 = Array.from(fml.getElementsByTagName("farmland")).filter(f => f.getAttribute("farmId") === "1");
    const pNodes = Array.from(pre?.getElementsByTagName("field") || []);
    const fNodes = Array.from(fld?.getElementsByTagName("field") || []);

    document.getElementById('f1-fields').innerHTML = `
        <thead>
            <tr>
                <th width="12%">FLD</th>
                <th width="30%">CROP TYPE</th>
                <th width="20%">NITROGEN</th>
                <th width="18%">LIME</th>
                <th width="20%">CYCLE STATE</th>
            </tr>
        </thead>
        <tbody>${owned1.map(l => {
            const id = l.getAttribute("id");
            const p = pNodes.find(n => n.getAttribute("id") === id);
            const f = fNodes.find(n => n.getAttribute("id") === id);
            
            // 1. US CONVERSION: KG TO LBS [cite: 2026-01-26]
            const nitrogenKg = parseFloat(p?.getAttribute("nitrogenValue") || 0);
            const nitrogenLbs = (nitrogenKg * 2.204).toFixed(0);
            
            // 2. GROWTH STATE COLOR LOGIC [cite: 2026-02-13]
            const state = (f?.getAttribute("growthState") || "EMPTY").toUpperCase();
            let stateColor = "#94a3b8"; // Default Grey
            let stateText = state;

            if (state.includes("GROWING")) { stateColor = "#22c55e"; stateText = "GROWING (GREEN)"; }
            else if (state.includes("HARVEST")) { stateColor = "#f97316"; stateText = "READY (ORANGE)"; }
            else if (state.includes("STUBBLE")) { stateColor = "#a855f7"; stateText = "HARVESTED (PURPLE)"; }
            else if (state.includes("CULTIVATED") || state.includes("PLOWED")) { stateColor = "#78350f"; stateText = "WORKED (BROWN)"; }
            else if (state.includes("WITHERED")) { stateColor = "#ef4444"; stateText = "DEAD (WITHERED)"; }

            return `
                <tr>
                    <td class="f1-text font-black">#${id}</td>
                    <td>${TRANSLATION[f?.getAttribute("fruitType")] || f?.getAttribute("fruitType") || "READY"}</td>
                    <td class="mono font-bold">${nitrogenLbs} lbs/ac</td>
                    <td class="mono ${p?.getAttribute("needsLime") === 'true' ? 'text-red-500 font-black' : 'text-green-500'}">
                        ${p?.getAttribute("needsLime") === 'true' ? 'REQUIRED' : 'OPTIMAL'}
                    </td>
                    <td style="color: ${stateColor}; font-weight: 900; font-size: 9px; text-transform: uppercase;">${stateText}</td>
                </tr>`;
        }).join('')}</tbody>`;
}
