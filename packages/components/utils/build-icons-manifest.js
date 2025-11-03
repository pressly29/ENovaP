const { EOL } = require('os');
const path = require('path');
const fs = require('fs');

const glob = require('glob');

const { getFileNameFromPath, getKebabCase, getPascalCase } = require('./helper');

const icons_list = require('./icons');

function validateIcons(svgs_map) {
    Object.keys(icons_list).forEach(icon_path => {
        const short_path = icons_list[icon_path].replace('.svg', '').replace('./src/components/icon/', '');
        const dir_name = path.dirname(short_path);

        const file_name = getFileNameFromPath(short_path);
        const icon_name = getPascalCase(file_name);

        let category = 'common';
        const category_match = new RegExp(`^Ic(${Object.keys(svgs_map).join('|')})`, 'gi').exec(icon_name);
        if (category_match && category_match[1]) {
            category = getKebabCase(category_match[1]);
        }

        if (category !== dir_name) {
            throw new Error(`'${file_name}' icon is in incorrect folder. Please move it to the ${category} folder.`);
        }
    });
}

function buildIconsManifest() {
    const sprite_bundles = glob.sync('./lib/icon/sprites/**/*.svg');

    const svgs_map = sprite_bundles.reduce((acc, fname) => {
        const name = getFileNameFromPath(fname);
        const svg_category = name.match(/^(.*?)\./)[1];
        acc[svg_category] = name;
        return acc;
    }, {});

    validateIcons(svgs_map);

    // Generate both .js and .ts files
    const buffer_js = ['// auto-generated file. DO NOT MODIFY.', ''];
    buffer_js.push(`module.exports = ${JSON.stringify(svgs_map, null, 2)}`);
    fs.writeFileSync(path.join(__dirname, '../src/components/icon/icons-manifest.js'), buffer_js.join(EOL) + EOL);

    // Generate TypeScript version with named exports that can be imported as an object
    const buffer_ts = ['// auto-generated file. DO NOT MODIFY.', ''];
    Object.keys(svgs_map).forEach(key => {
        buffer_ts.push(`export const ${key} = ${JSON.stringify(svgs_map[key])};`);
    });
    fs.writeFileSync(path.join(__dirname, '../src/components/icon/icons-manifest.ts'), buffer_ts.join(EOL) + EOL);
}

module.exports.buildIconsManifest = buildIconsManifest;
