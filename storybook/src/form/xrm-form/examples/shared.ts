import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const FORM_XML_CODE = `//a Dataverse form's layout, as its FormXml
export const FORM_XML = \`<form>
  <tabs>
    <tab name="summary">
      <labels><label description="Summary" languagecode="1033" /></labels>
      <columns>
        <column width="65%">
          <sections>
            <section name="account_information" columns="11" celllabelposition="Top">
              <labels><label description="Account information" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell>
                    <labels><label description="Account name" languagecode="1033" /></labels>
                    <control id="name" datafieldname="name" />
                  </cell>
                  <cell>
                    <labels><label description="Industry" languagecode="1033" /></labels>
                    <control id="industrycode" datafieldname="industrycode" />
                  </cell>
                </row>
                <row>
                  <cell>
                    <labels><label description="Phone" languagecode="1033" /></labels>
                    <control id="telephone1" datafieldname="telephone1" />
                  </cell>
                  <cell>
                    <labels><label description="Website" languagecode="1033" /></labels>
                    <control id="websiteurl" datafieldname="websiteurl" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
        <column width="35%">
          <sections>
            <section name="status" celllabelposition="Top">
              <labels><label description="Status" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell>
                    <labels><label description="Credit hold" languagecode="1033" /></labels>
                    <control id="creditonhold" datafieldname="creditonhold" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
    <tab name="details">
      <labels><label description="Details" languagecode="1033" /></labels>
      <columns>
        <column width="100%">
          <sections>
            <section name="financials" columns="11" celllabelposition="Top">
              <labels><label description="Financials" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell>
                    <labels><label description="Annual revenue" languagecode="1033" /></labels>
                    <control id="revenue" datafieldname="revenue" />
                  </cell>
                  <cell>
                    <labels><label description="Employees" languagecode="1033" /></labels>
                    <control id="numberofemployees" datafieldname="numberofemployees" />
                  </cell>
                </row>
              </rows>
            </section>
            <section name="notes" celllabelposition="Top">
              <labels><label description="Notes" languagecode="1033" /></labels>
              <rows>
                <row>
                  <cell>
                    <labels><label description="Description" languagecode="1033" /></labels>
                    <control id="description" datafieldname="description" />
                  </cell>
                </row>
              </rows>
            </section>
          </sections>
        </column>
      </columns>
    </tab>
  </tabs>
</form>\`
`

const ACCOUNT_DATA = `const INDUSTRIES = [
    { Value: 1, Label: 'Manufacturing', Color: '#0078d4' },
    { Value: 2, Label: 'Retail', Color: '#8764b8' },
    { Value: 3, Label: 'Professional services', Color: '#038387' },
]

const YES_NO = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
    { Value: 1, Label: 'Yes', Color: '#a4262c' },
]

//one column for every datafieldname in the FormXml
export const COLUMNS: IColumn[] = [
    //RequiredLevel 2 is Dataverse's Application Required
    { name: 'name', displayName: 'Account name', dataType: DataTypes.SingleLineText, isPrimary: true, metadata: { RequiredLevel: 2 } },
    { name: 'industrycode', displayName: 'Industry', dataType: DataTypes.OptionSet, metadata: { OptionSet: INDUSTRIES } },
    { name: 'telephone1', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },
    { name: 'websiteurl', displayName: 'Website', dataType: DataTypes.SingleLineUrl },
    { name: 'creditonhold', displayName: 'Credit hold', dataType: DataTypes.TwoOptions, metadata: { OptionSet: YES_NO } },
    { name: 'revenue', displayName: 'Annual revenue', dataType: DataTypes.Currency },
    { name: 'numberofemployees', displayName: 'Employees', dataType: DataTypes.WholeNone },
    { name: 'description', displayName: 'Description', dataType: DataTypes.Multiple },
]

//the record as the Dataverse Web API returns it
export const ACCOUNT = {
    accountid: '2f5c9b1e-7a43-4d0b-9a61-3c8e2b7f4d10',
    name: 'Contoso Ltd',
    industrycode: 3,
    telephone1: '+420 777 100 200',
    websiteurl: null,
    creditonhold: true,
    revenue: 1250000,
    numberofemployees: 240,
    description: null,
}
`

export const OVERVIEW_ACCOUNT_CODE = `import { DataTypes } from '@talxis/client-libraries'
import type { IColumn } from '@talxis/client-libraries'

${ACCOUNT_DATA}`

export const ACCOUNT_CODE = `import { createMemoryRecord } from '@talxis/base-controls'
import { DataTypes } from '@talxis/client-libraries'
import type { IColumn } from '@talxis/client-libraries'
import { FORM_XML } from './formXml'

${ACCOUNT_DATA}
//what XrmForm's onLoad resolves
export const loadAccount = async () => ({
    record: createMemoryRecord({ columns: COLUMNS, data: ACCOUNT, metadata: { PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name' } }),
    formXml: FORM_XML,
})
`

export const FORM_XML_FILE: IGridExampleFile = { name: 'formXml.ts', code: FORM_XML_CODE }

/** An example's own file first, then the account it loads with `loadAccount` and its FormXml. */
export const withAccount = (code: string): IGridExampleFile[] => [
    { name: 'GridExample.tsx', code },
    { name: 'account.ts', code: ACCOUNT_CODE },
    FORM_XML_FILE,
]
