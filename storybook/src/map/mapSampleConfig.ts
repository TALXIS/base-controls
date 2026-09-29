import { SAMPLE_ATTRIBUTES } from './mapSampleData'

/** Depots red, service points green, everything else blue - the pin rules a maker would type into the manifest. */
export const PIN_RULES = JSON.stringify([
    { attributeName: SAMPLE_ATTRIBUTES.category, value: 'depot', color: '#c50f1f' },
    { attributeName: SAMPLE_ATTRIBUTES.category, value: 'service', color: '#107c10' },
    { color: '#0f6cbd' }
], null, 2)

/** Legend markup. */
export const LEGEND_HTML = `
<h4 style="margin:4px 0">Site types</h4>
<ul style="list-style:none;padding:0;margin:0">
  <li style="display:flex;align-items:center;gap:8px;padding:1px 0">
    <svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="#c50f1f"></circle></svg> Distribution depot
  </li>
  <li style="display:flex;align-items:center;gap:8px;padding:1px 0">
    <svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="#0f6cbd"></circle></svg> Store
  </li>
  <li style="display:flex;align-items:center;gap:8px;padding:1px 0">
    <svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="#107c10"></circle></svg> Service point
  </li>
</ul>
<p style="margin:6px 0 0">Lines are delivery runs.</p>
`
