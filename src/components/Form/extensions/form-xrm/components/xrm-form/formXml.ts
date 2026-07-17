export const FORM_XML = `<form>
  <tabs>
    <tab name="General" id="{00000000-0000-0000-0000-000000000001}" expanded="true" showlabel="true">
      <labels><label description="General" languagecode="1033" /></labels>
      <columns>
        <column width="67%">
          <sections>
            <section name="general_info" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000001}" columns="2" labelwidth="140" celllabelposition="Top">
              <labels><label description="Account Information" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000001}"><labels><label description="Account Name" languagecode="1033" /></labels><control id="name" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="name" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000002}"><labels><label description="Phone" languagecode="1033" /></labels><control id="telephone1" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="telephone1" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000003}" colspan="2"><labels><label description="Email" languagecode="1033" /></labels><control id="emailaddress1" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="emailaddress1" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000004}" rowspan="2"><labels><label description="Primary Contact" languagecode="1033" /></labels><control id="primarycontactid" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="primarycontactid" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000005}"><labels><label description="Website" languagecode="1033" /></labels><control id="websiteurl" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="websiteurl" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000006}"><labels><label description="Ticker Symbol" languagecode="1033" /></labels><control id="tickersymbol" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="tickersymbol" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="33%">
          <sections>
            <section name="quick_snapshot" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000007}" columns="1" celllabelposition="Top">
              <labels><label description="Quick Snapshot" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000007}"><labels><label description="Owner" languagecode="1033" /></labels><control id="ownerid" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="ownerid" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000008}"><labels><label description="Status" languagecode="1033" /></labels><control id="statecode" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="statecode" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000009}"><labels><label description="Created On" languagecode="1033" /></labels><control id="createdon" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="createdon" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab name="Details" id="{00000000-0000-0000-0000-000000000002}" expanded="false" showlabel="true">
      <labels><label description="Details" languagecode="1033" /></labels>
      <columns>
        <column width="50%">
          <sections>
            <section name="address_info" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000002}" columns="3" labelwidth="110">
              <labels><label description="Address" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000010}" colspan="2"><labels><label description="Street" languagecode="1033" /></labels><control id="address1_line1" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address1_line1" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000011}"><labels><label description="Postal Code" languagecode="1033" /></labels><control id="address1_postalcode" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address1_postalcode" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000012}"><labels><label description="City" languagecode="1033" /></labels><control id="address1_city" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address1_city" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000014}"><labels><label description="State" languagecode="1033" /></labels><control id="address1_stateorprovince" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address1_stateorprovince" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000015}"><labels><label description="Country" languagecode="1033" /></labels><control id="address1_country" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address1_country" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="30%">
          <sections>
            <section name="description_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000003}" columns="2" celllabelposition="Top">
              <labels><label description="Description" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000013}" colspan="2"><labels><label description="Description" languagecode="1033" /></labels><control id="description" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="description" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000016}"><labels><label description="SIC Code" languagecode="1033" /></labels><control id="sic" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="sic" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000017}"><labels><label description="Employees" languagecode="1033" /></labels><control id="numberofemployees" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="numberofemployees" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="20%">
          <sections>
            <section name="metrics_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000008}" columns="1" celllabelposition="Top">
              <labels><label description="Metrics" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000018}"><labels><label description="Annual Revenue" languagecode="1033" /></labels><control id="revenue_detail" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="revenue" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000019}"><labels><label description="Credit Limit" languagecode="1033" /></labels><control id="creditlimit" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="creditlimit" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab name="Notes" id="{00000000-0000-0000-0000-000000000003}" expanded="false" showlabel="true">
      <labels><label description="Notes &amp; Activity" languagecode="1033" /></labels>
      <columns>
        <column width="25%">
          <sections>
            <section name="activity_summary" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000009}" columns="1" celllabelposition="Top">
              <labels><label description="Activity Summary" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000023}"><labels><label description="Open Tasks" languagecode="1033" /></labels><control id="opentasks" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="opentasks" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000024}"><labels><label description="Open Emails" languagecode="1033" /></labels><control id="openemails" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="openemails" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="25%">
          <sections>
            <section name="follow_up" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000010}" columns="1" celllabelposition="Top">
              <labels><label description="Follow Up" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000025}"><labels><label description="Due Date" languagecode="1033" /></labels><control id="followupdate" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="followupdate" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="25%">
          <sections>
            <section name="channel_mix" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000011}" columns="1" celllabelposition="Top">
              <labels><label description="Channel Mix" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000026}"><labels><label description="Preferred Channel" languagecode="1033" /></labels><control id="preferredchannel" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="preferredchannel" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="25%">
          <sections>
            <section name="notes_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000004}" columns="2" celllabelposition="Top">
              <labels><label description="Timeline" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000020}" rowspan="2"><labels><label description="Notes" languagecode="1033" /></labels><control id="notescontrol" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="notes" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000021}"><labels><label description="Next Action" languagecode="1033" /></labels><control id="nextaction" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="nextaction" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000022}"><labels><label description="Last Contacted" languagecode="1033" /></labels><control id="lastcontactedon" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="lastcontactedon" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab name="Related" id="{00000000-0000-0000-0000-000000000004}" expanded="false" showlabel="true" visible="true">
      <labels><label description="Related" languagecode="1033" /></labels>
      <columns>
        <column width="40%">
          <sections>
            <section name="contacts_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000005}" columns="2">
              <labels><label description="Contacts" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000030}" colspan="2"><labels><label description="Primary Contact" languagecode="1033" /></labels><control id="primarycontactid" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="primarycontactid" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000033}"><labels><label description="Assistant" languagecode="1033" /></labels><control id="assistantname" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="assistantname" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000034}"><labels><label description="Department" languagecode="1033" /></labels><control id="department" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="department" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="35%">
          <sections>
            <section name="opportunities_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000006}" columns="2" celllabelposition="Top">
              <labels><label description="Opportunities" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000031}"><labels><label description="Revenue" languagecode="1033" /></labels><control id="revenue" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="revenue" /></cell>
                  <cell id="{20000000-0000-0000-0000-000000000032}"><labels><label description="Industry" languagecode="1033" /></labels><control id="industrycode" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="industrycode" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000035}" colspan="2"><labels><label description="Opportunity Summary" languagecode="1033" /></labels><control id="opportunitysummary" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="opportunitysummary" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="25%">
          <sections>
            <section name="relationship_health" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000012}" columns="1" celllabelposition="Top">
              <labels><label description="Relationship Health" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000036}"><labels><label description="Last Meeting" languagecode="1033" /></labels><control id="lastmeeting" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="lastmeeting" /></cell>
                </row>
                <row>
                  <cell id="{20000000-0000-0000-0000-000000000037}"><labels><label description="Satisfaction Score" languagecode="1033" /></labels><control id="satisfactionscore" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="satisfactionscore" /></cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>`;