export const defaultFormXml = `
<form shownavigationbar="false" showImage="false">
  <tabs>
    <tab verticallayout="true" id="{10000000-0000-0000-0000-000000000001}" IsUserDefined="1" name="OverviewTab" locklevel="0" expanded="true" showlabel="true">
      <labels>
        <label description="Overview" languagecode="1033" />
      </labels>
      <columns>
        <column width="65%">
          <sections>
            <section name="primarySection" showlabel="true" showbar="false" locklevel="0" id="{10000000-0000-0000-0000-000000000002}" IsUserDefined="1" layout="varwidth" columns="11" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
              <labels>
                <label description="Primary details" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000003}" showlabel="true" locklevel="0">
                    <labels><label description="Text" languagecode="1033" /></labels>
                    <control id="text" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="text" disabled="false" />
                  </cell>
                  <cell id="{10000000-0000-0000-0000-000000000032}" showlabel="true" locklevel="0">
                    <labels><label description="Phone" languagecode="1033" /></labels>
                    <control id="phone" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="phone" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000005}" showlabel="true" locklevel="0" colspan="2">
                    <labels><label description="Url" languagecode="1033" /></labels>
                    <control id="url" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="url" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000006}" showlabel="true" locklevel="0" rowspan="2" colspan="2">
                    <labels><label description="Multiline text" languagecode="1033" /></labels>
                    <control id="multilinetext" classid="{E0DECE4B-6FC8-4A8F-A065-082708572369}" datafieldname="multilinetext" disabled="false" />
                  </cell>
                </row>
                <row />
              </rows>
            </section>
          </sections>
        </column>
        <column width="35%">
          <sections>
            <section name="typesSection" showlabel="true" showbar="false" locklevel="0" id="{10000000-0000-0000-0000-000000000007}" IsUserDefined="1" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Top">
              <labels>
                <label description="Contact channels" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000009}" showlabel="true" locklevel="0">
                    <labels><label description="Two options" languagecode="1033" /></labels>
                    <control id="twooptions" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="twooptions" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000010}" showlabel="true" locklevel="0">
                    <labels><label description="Option set" languagecode="1033" /></labels>
                    <control id="optionset" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="optionset" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000011}" showlabel="true" locklevel="0">
                    <labels><label description="Two options colorful" languagecode="1033" /></labels>
                    <control id="twooptionscolorful" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="twooptionscolorful" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000012}" showlabel="true" locklevel="0">
                    <labels><label description="Option set colorful" languagecode="1033" /></labels>
                    <control id="optionsetcolorful" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="optionsetcolorful" disabled="false" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab verticallayout="true" id="{10000000-0000-0000-0000-000000000016}" IsUserDefined="1" name="MetricsTab" locklevel="0" expanded="true" showlabel="true">
      <labels>
        <label description="Metrics" languagecode="1033" />
      </labels>
      <columns>
        <column width="40%">
          <sections>
            <section name="numericSection" showlabel="true" showbar="false" locklevel="0" id="{10000000-0000-0000-0000-000000000017}" IsUserDefined="1" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Left">
              <labels>
                <label description="Numeric values" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000018}" showlabel="true" locklevel="0">
                    <labels><label description="Number" languagecode="1033" /></labels>
                    <control id="number" classid="{C6D124CA-7EDA-4A60-AEA9-7FB8D318B68F}" datafieldname="number" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000019}" showlabel="true" locklevel="0">
                    <labels><label description="Decimal" languagecode="1033" /></labels>
                    <control id="decimal" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="decimal" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000020}" showlabel="true" locklevel="0">
                    <labels><label description="Currency" languagecode="1033" /></labels>
                    <control id="currency" classid="{533B9E00-756B-4312-95A0-DC888637AC78}" datafieldname="currency" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000021}" showlabel="true" locklevel="0">
                    <labels><label description="Duration" languagecode="1033" /></labels>
                    <control id="duration" classid="{C6D124CA-7EDA-4A60-AEA9-7FB8D318B68F}" datafieldname="duration" disabled="false" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="60%">
          <sections>
            <section name="selectionSection" showlabel="true" showbar="false" locklevel="0" id="{10000000-0000-0000-0000-000000000022}" IsUserDefined="1" layout="varwidth" columns="11" labelwidth="115" celllabelalignment="Left" celllabelposition="Top">
              <labels>
                <label description="Selections" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000023}" showlabel="true" locklevel="0">
                    <labels><label description="Multi select option set" languagecode="1033" /></labels>
                    <control id="multiselectoptionset" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="multiselectoptionset" disabled="false" />
                  </cell>
                  <cell id="{10000000-0000-0000-0000-000000000033}" showlabel="true" locklevel="0">
                    <labels><label description="Multi select colorful" languagecode="1033" /></labels>
                    <control id="multiselectoptionsetcolorfulPrimary" classid="{3EF39988-22BB-4F0B-BBBE-64B5A3748AEE}" datafieldname="multiselectoptionsetcolorful" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000024}" showlabel="true" locklevel="0" colspan="2">
                    <labels><label description="Two options colorful" languagecode="1033" /></labels>
                    <control id="twooptionscolorfulMetrics" classid="{67FAC785-CD58-4F9F-ABB3-4B7DDC6ED5ED}" datafieldname="twooptionscolorful" disabled="false" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab verticallayout="true" id="{10000000-0000-0000-0000-000000000025}" IsUserDefined="1" name="SchedulingTab" locklevel="0" expanded="true" showlabel="true">
      <labels>
        <label description="Scheduling" languagecode="1033" />
      </labels>
      <columns>
        <column width="30%">
          <sections>
            <section name="datesSection" showlabel="true" showbar="false" locklevel="0" id="{10000000-0000-0000-0000-000000000026}" IsUserDefined="1" layout="varwidth" columns="1" labelwidth="115" celllabelalignment="Left" celllabelposition="Top">
              <labels>
                <label description="Dates" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000027}" showlabel="true" locklevel="0">
                    <labels><label description="Date only" languagecode="1033" /></labels>
                    <control id="dateonly" classid="{5B773807-9FB2-42DB-97C3-7A91EFF8ADFF}" datafieldname="dateonly" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000028}" showlabel="true" locklevel="0">
                    <labels><label description="Date time" languagecode="1033" /></labels>
                    <control id="datetime" classid="{5B773807-9FB2-42DB-97C3-7A91EFF8ADFF}" datafieldname="datetime" disabled="false" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="70%">
          <sections>
            <section name="attachmentsSection" showlabel="true" showbar="false" locklevel="0" id="{10000000-0000-0000-0000-000000000029}" IsUserDefined="1" layout="varwidth" columns="11" labelwidth="115" celllabelalignment="Left" celllabelposition="Top">
              <labels>
                <label description="Handoff details" languagecode="1033" />
              </labels>
              <rows>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000031}" showlabel="true" locklevel="0">
                    <labels><label description="Reference URL" languagecode="1033" /></labels>
                    <control id="handoffUrl" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="url" disabled="false" />
                  </cell>
                </row>
                <row>
                  <cell id="{10000000-0000-0000-0000-000000000034}" showlabel="true" locklevel="0">
                    <labels><label description="Handoff notes" languagecode="1033" /></labels>
                    <control id="handoffNotes" classid="{E0DECE4B-6FC8-4A8F-A065-082708572369}" datafieldname="multilinetext" disabled="false" />
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