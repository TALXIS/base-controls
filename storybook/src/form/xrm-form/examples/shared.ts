import type { IGridExampleFile } from '../../../grid/GridLivePreview'

type IAccountField = 'name' | 'industrycode' | 'telephone1' | 'websiteurl' | 'creditonhold' | 'description'

interface ISectionSpec {
    name: string
    label: string
    fields: IAccountField[]
    //the FormXml `columns`, one digit per column
    columns?: string
}

/** One tab of an example's FormXml, by the fields it places. */
export interface ITabSpec {
    name: string
    label: string
    columns: { width: string; sections: ISectionSpec[] }[]
}

const FIELDS: { [field in IAccountField]: { label: string; column: string; value: string } } = {
    name: {
        label: 'Account name',
        column: `    //RequiredLevel 2 is Dataverse's Application Required
    { name: 'name', displayName: 'Account name', dataType: DataTypes.SingleLineText, isPrimary: true, metadata: { RequiredLevel: 2 } },`,
        value: `name: 'Contoso Ltd'`,
    },
    industrycode: {
        label: 'Industry',
        column: `    { name: 'industrycode', displayName: 'Industry', dataType: DataTypes.OptionSet, metadata: { OptionSet: [
        { Value: 1, Label: 'Manufacturing', Color: '#0078d4' },
        { Value: 2, Label: 'Retail', Color: '#8764b8' },
        { Value: 3, Label: 'Professional services', Color: '#038387' },
    ] } },`,
        value: `industrycode: 3`,
    },
    telephone1: {
        label: 'Phone',
        column: `    { name: 'telephone1', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },`,
        value: `telephone1: '+420 777 100 200'`,
    },
    websiteurl: {
        label: 'Website',
        column: `    { name: 'websiteurl', displayName: 'Website', dataType: DataTypes.SingleLineUrl },`,
        value: `websiteurl: null`,
    },
    creditonhold: {
        label: 'Credit hold',
        column: `    { name: 'creditonhold', displayName: 'Credit hold', dataType: DataTypes.TwoOptions, metadata: { OptionSet: [
        { Value: 0, Label: 'No', Color: '#605e5c' },
        { Value: 1, Label: 'Yes', Color: '#a4262c' },
    ] } },`,
        value: `creditonhold: true`,
    },
    description: {
        label: 'Description',
        column: `    { name: 'description', displayName: 'Description', dataType: DataTypes.Multiple },`,
        value: `description: null`,
    },
}

/** A *Summary* tab with one section of these fields. */
export const accountTab = (...fields: IAccountField[]): ITabSpec => ({ name: 'summary', label: 'Summary', columns: [{ width: '100%', sections: [{ name: 'account_information', label: 'Account information', fields }] }] })

/** A *Details* tab holding the description. */
export const DETAILS_TAB: ITabSpec = { name: 'details', label: 'Details', columns: [{ width: '100%', sections: [{ name: 'notes', label: 'Notes', fields: ['description'] }] }] }

const label = (text: string, indent: string) => `${indent}<labels><label description="${text}" languagecode="1033" /></labels>`

const toRows = (section: ISectionSpec) => {
    const perRow = section.columns?.length ?? 1
    const rows: IAccountField[][] = []
    section.fields.forEach((field, index) => index % perRow === 0 ? rows.push([field]) : rows[rows.length - 1].push(field))
    return rows.map(row => `                <row>
${row.map(field => `                  <cell>
${label(FIELDS[field].label, '                    ')}
                    <control id="${field}" datafieldname="${field}" />
                  </cell>`).join('\n')}
                </row>`).join('\n')
}

const toFormXml = (tabs: ITabSpec[]) => `<form>
  <tabs>
${tabs.map(tab => `    <tab name="${tab.name}">
${label(tab.label, '      ')}
      <columns>
${tab.columns.map(column => `        <column width="${column.width}">
          <sections>
${column.sections.map(section => `            <section name="${section.name}"${section.columns ? ` columns="${section.columns}"` : ''}>
${label(section.label, '              ')}
              <rows>
${toRows(section)}
              </rows>
            </section>`).join('\n')}
          </sections>
        </column>`).join('\n')}
      </columns>
    </tab>`).join('\n')}
  </tabs>
</form>`

const getFields = (tabs: ITabSpec[]) => tabs.flatMap(tab => tab.columns.flatMap(column => column.sections.flatMap(section => section.fields)))

/** *formXml.ts*: a Dataverse form's FormXml with only these tabs. */
export const formXmlFile = (tabs: ITabSpec[]): IGridExampleFile => ({ name: 'formXml.ts', code: `//a Dataverse form's layout, as its FormXml
export const FORM_XML = \`${toFormXml(tabs)}\`
` })

const accountData = (fields: IAccountField[]) => `//one column for every datafieldname in the FormXml
export const COLUMNS: IColumn[] = [
${fields.map(field => FIELDS[field].column).join('\n')}
]

//the record as the Dataverse Web API returns it
export const ACCOUNT = { accountid: '2f5c9b1e-7a43-4d0b-9a61-3c8e2b7f4d10', ${fields.map(field => FIELDS[field].value).join(', ')} }
`

/** *account.ts* with only the columns and data of the fields the tabs place. */
export const accountDataFile = (tabs: ITabSpec[]): IGridExampleFile => ({ name: 'account.ts', code: `import { DataTypes } from '@talxis/client-libraries'
import type { IColumn } from '@talxis/client-libraries'

${accountData(getFields(tabs))}` })

/** An example's own file first, then the account it loads with `loadAccount` and a FormXml of these tabs. */
export const withAccount = (code: string, tabs: ITabSpec[]): IGridExampleFile[] => [
    { name: 'GridExample.tsx', code },
    { name: 'account.ts', code: `import { createMemoryRecord } from '@talxis/base-controls'
import { DataTypes } from '@talxis/client-libraries'
import type { IColumn } from '@talxis/client-libraries'
import { FORM_XML } from './formXml'

${accountData(getFields(tabs))}
//what XrmForm's onLoad resolves
export const loadAccount = async () => ({
    record: createMemoryRecord({ columns: COLUMNS, data: ACCOUNT, metadata: { PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name' } }),
    formXml: FORM_XML,
})
` },
    formXmlFile(tabs),
]
