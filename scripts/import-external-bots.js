/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue */
/*
 Import external bot XMLs from dayotraders/megadbot and make them compatible.
 - Dedupe: skip if a same-named file already exists in apollo_bots folder
 - Transform: purchase -> apollo_purchase; DIGITSMATCH -> DIGITMATCH
 - Save to: packages/bot-skeleton/src/scratch/xml/apollo_bots/
*/

const https = require('https');
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.resolve(__dirname, '..', 'packages', 'bot-skeleton', 'src', 'scratch', 'xml', 'apollo_bots');

const bots = [
    {
        name: 'Algo Sniper',
        url: 'https://raw.githubusercontent.com/dayotraders/megadbot/main/packages/bot-skeleton/src/utils/bots/AlgoSniper.xml',
        filename: 'AlgoSniper.xml',
    },
    {
        name: 'Signal Sniper Auto Bot',
        url: 'https://raw.githubusercontent.com/dayotraders/megadbot/main/packages/bot-skeleton/src/utils/bots/SignalSniperAutoBot.xml',
        filename: 'SignalSniperAutoBot.xml',
    },
    {
        name: 'BRAM EVEN ODD PRINTER',
        url: 'https://raw.githubusercontent.com/dayotraders/megadbot/main/packages/bot-skeleton/src/utils/bots/BRAMEVENODDPRINTER.xml',
        filename: 'BRAMEVENODDPRINTER.xml',
    },
    {
        name: 'Dollar Print AI',
        url: 'https://raw.githubusercontent.com/dayotraders/megadbot/main/packages/bot-skeleton/src/utils/bots/DollarPrintAi.xml',
        filename: 'DollarPrintAi.xml',
    },
];

function fetch(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, res => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
                    res.resume();
                    return;
                }
                let data = '';
                res.setEncoding('utf8');
                res.on('data', chunk => (data += chunk));
                res.on('end', () => resolve(data));
            })
            .on('error', reject);
    });
}

function transformXml(source) {
    // Ensure is_dbot present
    let xml = source;
    xml = xml.replace(/type=\"purchase\"/g, 'type="apollo_purchase"');
    xml = xml.replace(/DIGITSMATCH/g, 'DIGITMATCH');
    // minor: normalize Windows line endings
    xml = xml.replace(/\r\n/g, '\n');
    return xml;
}

async function run() {
    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    console.log(`\n[Import] Target: ${TARGET_DIR}`);

    let imported = 0;
    for (const bot of bots) {
        const targetPath = path.join(TARGET_DIR, bot.filename);
        if (fs.existsSync(targetPath)) {
            console.log(`[Skip] ${bot.name} already exists as ${bot.filename}`);
            continue;
        }
        try {
            console.log(`[Fetch] ${bot.name} ...`);
            const raw = await fetch(bot.url);
            const xml = transformXml(raw);
            fs.writeFileSync(targetPath, xml, 'utf8');
            console.log(`[OK] Saved ${bot.filename} (${xml.length} bytes)`);
            imported++;
        } catch (e) {
            console.error(`[Fail] ${bot.name}: ${e.message}`);
        }
    }

    if (imported > 0) {
        console.log(`\n[Import] Done. Imported ${imported} bot XML file(s).`);
    } else {
        console.log('\n[Import] No new bots imported (files may already be present or were skipped).');
    }

    // Always run a local normalization pass over ALL XML files in the folder.
    const entries = fs.readdirSync(TARGET_DIR).filter(f => f.toLowerCase().endsWith('.xml'));
    let normalized = 0;
    for (const file of entries) {
        const p = path.join(TARGET_DIR, file);
        try {
            const src = fs.readFileSync(p, 'utf8');
            const out = transformXml(src);
            if (out !== src) {
                fs.writeFileSync(p, out, 'utf8');
                normalized++;
                console.log(`[Normalize] Fixed ${file}`);
            }
        } catch (e) {
            console.error(`[Normalize Fail] ${file}: ${e.message}`);
        }
    }
    console.log(`\n[Normalize] Completed. ${normalized} file(s) updated.`);
    console.log('Next: wire them into Advanced Strategies (UI + runtime).');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
