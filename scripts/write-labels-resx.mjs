//Writes dist/resx/base-controls.<lcid>.resx from the built label sets
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { BASE_CONTROLS_LABEL_SETS } = await import(path.join(root, 'dist/labels/sets/en.js'));
const { CZECH_LABELS } = await import(path.join(root, 'dist/labels/sets/cs.js'));

const ENGLISH_LABELS = Object.assign({}, ...BASE_CONTROLS_LABEL_SETS.map(set => set.defaults));
const LABELS_BY_LANGUAGE = { 1033: ENGLISH_LABELS, 1029: CZECH_LABELS };

const escapeXml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toResx = labels => `<?xml version="1.0" encoding="utf-8"?>
<root>
	<resheader name="resmimetype">
		<value>text/microsoft-resx</value>
	</resheader>
	<resheader name="version">
		<value>2.0</value>
	</resheader>
	<resheader name="reader">
		<value>System.Resources.ResXResourceReader, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
	</resheader>
	<resheader name="writer">
		<value>System.Resources.ResXResourceWriter, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
	</resheader>
${Object.entries(labels).map(([key, value]) => `	<data name="${escapeXml(key)}" xml:space="preserve">\n		<value>${escapeXml(value)}</value>\n	</data>`).join('\n')}
</root>
`;

const folder = path.join(root, 'dist/resx');
await mkdir(folder, { recursive: true });
for (const [languageId, labels] of Object.entries(LABELS_BY_LANGUAGE)) {
    await writeFile(path.join(folder, `base-controls.${languageId}.resx`), toResx(labels));
}
