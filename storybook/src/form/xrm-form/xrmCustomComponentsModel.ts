import { DataTypes, type IColumn } from "@talxis/client-libraries"
import { IXrmFormStrategy, MemoryStrategy } from "@talxis/base-controls/components/Form"
import { createModelStore } from "../shared/modelStore"
import { createModelColumn } from "../shared/modelDefinition"

const customComponentsColumns: IColumn[] = [
    {
        name: "id",
        alias: "id",
        isHidden: true,
        displayName: "ID",
        dataType: DataTypes.SingleLineText,
    },
    createModelColumn(DataTypes.SingleLineText, {
        name: "text",
        alias: "text",
        displayName: "Lead name",
        isPrimary: true,
    }),
    createModelColumn(DataTypes.SingleLinePhone, {
        name: "phone",
        alias: "phone",
        displayName: "Primary phone",
    }),
    createModelColumn(DataTypes.SingleLineUrl, {
        name: "url",
        alias: "url",
        displayName: "Workspace URL",
    }),
    createModelColumn(DataTypes.OptionSet, {
        name: "optionset",
        alias: "optionset",
        displayName: "Engagement stage",
        metadata: {
            IsValidForUpdate: true,
            OptionSet: [
                { Label: "New", Value: 1, Color: "#0EA5E9" },
                { Label: "Qualified", Value: 2, Color: "#8B5CF6" },
                { Label: "Ready", Value: 3, Color: "#10B981" },
            ],
        },
    }),
    createModelColumn(DataTypes.WholeNone, {
        name: "number",
        alias: "number",
        displayName: "Momentum score",
    }),
    createModelColumn(DataTypes.Multiple, {
        name: "multilinetext",
        alias: "multilinetext",
        displayName: "Implementation notes",
    }),
]

const customComponentsFormXml = `
<form shownavigationbar="false" showImage="false">
  <tabs>
    <tab verticallayout="true" id="{20000000-0000-0000-0000-000000000001}" IsUserDefined="1" name="CustomComponentsTab" locklevel="0" expanded="true" showlabel="true">
      <labels>
        <label description="General" languagecode="1033" />
      </labels>
      <columns>
        <column width="100%">
          <sections>
            <section name="customControlsSection" showlabel="true" showbar="false" locklevel="0" id="{20000000-0000-0000-0000-000000000002}" IsUserDefined="1" layout="varwidth" columns="11" labelwidth="130" celllabelalignment="Left" celllabelposition="Left">
              <labels>
                <label description="Custom controls" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000003}" showlabel="false" locklevel="0">
                    <labels><label description="Lead name" languagecode="1033" /></labels>
                    <control id="customLeadName" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="text" disabled="false" />
                  </cell>
                  <cell id="{20000000-0000-0000-0000-000000000004}" showlabel="false" locklevel="0">
                    <labels><label description="Primary phone" languagecode="1033" /></labels>
                    <control id="customPhoneNumber" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="phone" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000005}" showlabel="false" locklevel="0">
                    <labels><label description="Engagement stage" languagecode="1033" /></labels>
                    <control id="customEngagementStage" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="optionset" disabled="false" />
                  </cell>
                  <cell id="{20000000-0000-0000-0000-000000000006}" showlabel="false" locklevel="0">
                    <labels><label description="Momentum score" languagecode="1033" /></labels>
                    <control id="customMomentumScore" classid="{C6D124CA-7EDA-4A60-AEA9-7FB8D318B68F}" datafieldname="number" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000007}" showlabel="false" locklevel="0" colspan="2">
                    <labels><label description="Workspace URL" languagecode="1033" /></labels>
                    <control id="customWorkspaceUrl" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="url" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000011}" showlabel="false" locklevel="0" colspan="2" rowspan="2">
                    <labels><label description="Implementation notes" languagecode="1033" /></labels>
                    <control id="customNotesPanel" classid="{E0DECE4B-6FC8-4A8F-A065-082708572369}" datafieldname="multilinetext" disabled="false" />
                  </cell>
                </row>
                <row />
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab verticallayout="true" id="{20000000-0000-0000-0000-000000000012}" IsUserDefined="1" name="FallbackControlsTab" locklevel="0" expanded="false" showlabel="true">
      <labels>
        <label description="Fallback" languagecode="1033" />
      </labels>
      <columns>
        <column width="100%">
          <sections>
            <section name="defaultControlsSection" showlabel="true" showbar="false" locklevel="0" id="{20000000-0000-0000-0000-000000000008}" IsUserDefined="1" layout="varwidth" columns="1" labelwidth="130" celllabelalignment="Left" celllabelposition="Top">
              <labels>
                <label description="Default fallback controls" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000009}" showlabel="true" locklevel="0">
                    <labels><label description="Lead name (default)" languagecode="1033" /></labels>
                    <control id="textDefault" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="text" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000010}" showlabel="true" locklevel="0">
                    <labels><label description="Workspace URL (default)" languagecode="1033" /></labels>
                    <control id="urlDefault" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="url" disabled="false" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab verticallayout="true" id="{20000000-0000-0000-0000-000000000013}" IsUserDefined="1" name="NotesSummaryTab" locklevel="0" expanded="false" showlabel="true">
      <labels>
        <label description="Notes" languagecode="1033" />
      </labels>
      <columns>
        <column width="100%">
          <sections>
            <section name="notesSummarySection" showlabel="true" showbar="false" locklevel="0" id="{20000000-0000-0000-0000-000000000014}" IsUserDefined="1" layout="varwidth" columns="1" labelwidth="130" celllabelalignment="Left" celllabelposition="Top">
              <labels>
                <label description="Narrative summary" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000015}" showlabel="false" locklevel="0">
                    <labels><label description="Implementation notes" languagecode="1033" /></labels>
                    <control id="customNotesPanelSummary" classid="{E0DECE4B-6FC8-4A8F-A065-082708572369}" datafieldname="multilinetext" disabled="false" />
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
`.trim()

const customComponentsRecord = {
    id: "custom-components-demo",
    text: "Northwind Design Review",
    phone: "+420 721 333 999",
    url: "https://northwind.example.com/workspace",
    optionset: 2,
    number: 72,
    multilinetext: "The custom renderer highlights only selected control ids. All other controls intentionally fall back to the stock Form control renderer.",
}

const customComponentsMetadata = {
    PrimaryIdAttribute: "id",
    PrimaryNameAttribute: "text",
}

let currentCustomComponentsFormXml = customComponentsFormXml

export const xrmCustomComponentsModelStore = createModelStore(customComponentsColumns)

class SandboxCustomComponentsStrategy extends MemoryStrategy implements IXrmFormStrategy {
    public onGetFormXml(): string {
        return currentCustomComponentsFormXml
    }
}

const customComponentsStrategy = new SandboxCustomComponentsStrategy({
    onGetData: () => customComponentsRecord,
    onGetColumns: () => xrmCustomComponentsModelStore.getRuntimeColumns(),
    onGetMetadata: () => customComponentsMetadata,
})

export const getCustomComponentsFormXml = () => currentCustomComponentsFormXml

export const setCustomComponentsFormXml = (value: string) => {
    currentCustomComponentsFormXml = value
}

export const getCustomComponentsRecord = () => customComponentsRecord

export const getCustomComponentsStrategy = () => customComponentsStrategy
