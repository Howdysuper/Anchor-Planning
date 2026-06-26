import fs from 'fs';
let css = fs.readFileSync('src/components/settings/themes.css', 'utf8');
css = css.replace(/:is\(\.theme-neon, \.theme-cosmic, \.theme-forest\)/g, ':is(.theme-neon, .theme-cosmic, .theme-forest, .theme-hacker)');
fs.writeFileSync('src/components/settings/themes.css', css);
