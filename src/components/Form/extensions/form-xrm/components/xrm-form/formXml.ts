export const FORM_XML = `<form>
  <tabs>
    <tab name="General" id="{00000000-0000-0000-0000-000000000001}" expanded="true" showlabel="true">
      <labels><label description="General" languagecode="1033" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section name="general_info" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000001}">
              <labels><label description="Account Information" languagecode="1033" /></labels>
              <rows>
                <row><cell id="{20000000-0000-0000-0000-000000000001}"><labels><label description="Account Name" languagecode="1033" /></labels><control id="name" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="name" /></cell></row>
                <row><cell id="{20000000-0000-0000-0000-000000000002}"><labels><label description="Phone" languagecode="1033" /></labels><control id="telephone1" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="telephone1" /></cell></row>
                <row><cell id="{20000000-0000-0000-0000-000000000003}"><labels><label description="Email" languagecode="1033" /></labels><control id="emailaddress1" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="emailaddress1" /></cell></row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab name="Details" id="{00000000-0000-0000-0000-000000000002}" expanded="false" showlabel="true">
      <labels><label description="Details" languagecode="1033" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section name="address_info" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000002}">
              <labels><label description="Address" languagecode="1033" /></labels>
              <rows>
                <row><cell id="{20000000-0000-0000-0000-000000000010}"><labels><label description="Street" languagecode="1033" /></labels><control id="address1_line1" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address1_line1" /></cell></row>
                <row><cell id="{20000000-0000-0000-0000-000000000011}"><labels><label description="City" languagecode="1033" /></labels><control id="address1_city" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address1_city" /></cell></row>
                <row><cell id="{20000000-0000-0000-0000-000000000012}"><labels><label description="Country" languagecode="1033" /></labels><control id="address1_country" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="address1_country" /></cell></row>
              </rows>
            </section>
            <section name="description_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000003}">
              <labels><label description="Description" languagecode="1033" /></labels>
              <rows>
                <row><cell id="{20000000-0000-0000-0000-000000000013}"><labels><label description="Description" languagecode="1033" /></labels><control id="description" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="description" /></cell></row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab name="Notes" id="{00000000-0000-0000-0000-000000000003}" expanded="false" showlabel="true">
      <labels><label description="Notes &amp; Activity" languagecode="1033" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section name="notes_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000004}">
              <labels><label description="Timeline" languagecode="1033" /></labels>
              <rows>
                <row><cell id="{20000000-0000-0000-0000-000000000020}"><labels><label description="Notes" languagecode="1033" /></labels><control id="notescontrol" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="notes" /></cell></row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab name="Related" id="{00000000-0000-0000-0000-000000000004}" expanded="false" showlabel="true" visible="true">
      <labels><label description="Related" languagecode="1033" /></labels>
      <columns>
        <column width="50%">
          <sections>
            <section name="contacts_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000005}">
              <labels><label description="Contacts" languagecode="1033" /></labels>
              <rows>
                <row><cell id="{20000000-0000-0000-0000-000000000030}"><labels><label description="Primary Contact" languagecode="1033" /></labels><control id="primarycontactid" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="primarycontactid" /></cell></row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="50%">
          <sections>
            <section name="opportunities_section" showlabel="true" showbar="true" id="{10000000-0000-0000-0000-000000000006}">
              <labels><label description="Opportunities" languagecode="1033" /></labels>
              <rows>
                <row><cell id="{20000000-0000-0000-0000-000000000031}"><labels><label description="Revenue" languagecode="1033" /></labels><control id="revenue" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="revenue" /></cell></row>
                <row><cell id="{20000000-0000-0000-0000-000000000032}"><labels><label description="Industry" languagecode="1033" /></labels><control id="industrycode" classid="{4273EDBD-AC1D-40D3-9FB2-095C621B552D}" datafieldname="industrycode" /></cell></row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>`;