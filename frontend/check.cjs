const fs = require('fs');
const path = require('path');
const uz = JSON.parse(fs.readFileSync('src/i18n/locales/uz.json'));
function getNested(obj, p) { return p.split('.').reduce((o, k) => (o || {})[k], obj); }
function walk(dir, cb) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p, cb);
        else cb(p);
    });
}
let missing = new Set();
walk('src', p => {
    if (p.endsWith('.tsx') || p.endsWith('.ts')) {
        let content = fs.readFileSync(p, 'utf-8');
        let m = content.match(/t\(['"][a-zA-Z0-9_\.]+['"]/g);
        if (m) {
            m.forEach(match => {
                let key = match.substring(3, match.length - 1);
                if (!getNested(uz, key)) {
                    missing.add(key);
                }
            });
        }
    }
});
console.log(Array.from(missing).join('\n'));
