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

/** An Adaptive Card template bound to a site record. */
export const ADAPTIVE_CARD_TEMPLATE = JSON.stringify({
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
        { type: 'TextBlock', text: '${$root.name}', weight: 'Bolder', size: 'Medium', wrap: true },
        { type: 'TextBlock', text: '${$root.address}', isSubtle: true, wrap: true, spacing: 'None' },
        {
            type: 'FactSet',
            facts: [
                { title: 'Category', value: '${$root.category}' },
                { title: 'Capacity', value: '${$root.capacity_label}' },
                { title: 'Opened', value: '${$root.openedOn}' }
            ]
        }
    ],
    actions: [{
        type: 'Action.Submit',
        title: 'Plan a visit',
        data: { webResourceName: 'ntg_map.js', functionName: 'TALXIS.Map.planVisit' }
    }]
})

/** Id the sample site form answers to, standing in for a `systemform` a maker designed in Dataverse. */
export const SITE_CARD_FORM_ID = '6f1d3c2a-9b4e-4f7a-8c21-5d0e7a9b3f10'

/** A one-section FormXml the Form base control lays a site record out with. */
export const SITE_CARD_FORM_XML = `
<form shownavigationbar="false" showImage="false">
  <tabs>
    <tab verticallayout="true" id="{20000000-0000-0000-0000-000000000001}" IsUserDefined="1" name="SiteTab" locklevel="0" expanded="true" showlabel="false">
      <labels><label description="Site" languagecode="1033" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section name="siteSection" showlabel="false" showbar="false" locklevel="0" id="{20000000-0000-0000-0000-000000000002}" IsUserDefined="1" layout="varwidth" columns="1" labelwidth="100" celllabelalignment="Left" celllabelposition="Left">
              <labels><label description="Site" languagecode="1033" /></labels>
              <rows>
            <row>
              <cell id="{20000000-0000-0000-0000-000000000011}" showlabel="true" locklevel="0">
                <labels><label description="Name" languagecode="1033" /></labels>
                <control id="name" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="name" disabled="true" />
              </cell>
            </row>
            <row>
              <cell id="{20000000-0000-0000-0000-000000000012}" showlabel="true" locklevel="0">
                <labels><label description="Category" languagecode="1033" /></labels>
                <control id="category" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="category" disabled="false" />
              </cell>
            </row>
            <row>
              <cell id="{20000000-0000-0000-0000-000000000013}" showlabel="true" locklevel="0">
                <labels><label description="Address" languagecode="1033" /></labels>
                <control id="address" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address" disabled="false" />
              </cell>
            </row>
            <row>
              <cell id="{20000000-0000-0000-0000-000000000014}" showlabel="true" locklevel="0">
                <labels><label description="Capacity" languagecode="1033" /></labels>
                <control id="capacity" classid="{C6D124CA-7EDA-4A60-AEA9-7FB8D318B68F}" datafieldname="capacity" disabled="false" />
              </cell>
            </row>
            <row>
              <cell id="{20000000-0000-0000-0000-000000000015}" showlabel="true" locklevel="0">
                <labels><label description="Opened on" languagecode="1033" /></labels>
                <control id="openedOn" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="openedOn" disabled="false" />
              </cell>
            </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>
`
