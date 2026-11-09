import type { IGridExampleFile } from '../../grid/GridLivePreview'

type IAccountField = 'name' | 'telephone1' | 'emailaddress1' | 'websiteurl' | 'industrycode' | 'creditlimit' | 'customersince' | 'rating' | 'active' | 'description'

const COLUMNS: { [field in IAccountField]: string } = {
    name: `        //RequiredLevel 2 makes the column required wherever it is edited
        { name: 'name', displayName: 'Account name', dataType: DataTypes.SingleLineText, metadata: { RequiredLevel: 2 } },`,
    telephone1: `        { name: 'telephone1', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },`,
    emailaddress1: `        { name: 'emailaddress1', displayName: 'Email', dataType: DataTypes.SingleLineEmail },`,
    websiteurl: `        { name: 'websiteurl', displayName: 'Website', dataType: DataTypes.SingleLineUrl },`,
    industrycode: `        { name: 'industrycode', displayName: 'Industry', dataType: DataTypes.OptionSet, metadata: { OptionSet: [
            { Value: 1, Label: 'Consulting', Color: '#0078d4' },
            { Value: 2, Label: 'Manufacturing', Color: '#8764b8' },
            { Value: 3, Label: 'Retail', Color: '#038387' },
        ] } },`,
    creditlimit: `        { name: 'creditlimit', displayName: 'Credit limit', dataType: DataTypes.Currency },`,
    customersince: `        { name: 'customersince', displayName: 'Customer since', dataType: DataTypes.DateAndTimeDateOnly },`,
    rating: `        { name: 'rating', displayName: 'Rating', dataType: DataTypes.WholeNone, metadata: { MinValue: 1, MaxValue: 5 } },`,
    active: `        { name: 'active', displayName: 'Active', dataType: DataTypes.TwoOptions, metadata: { OptionSet: [
            { Value: 1, Label: 'Yes', Color: '' },
            { Value: 0, Label: 'No', Color: '' },
        ] } },`,
    description: `        { name: 'description', displayName: 'Description', dataType: DataTypes.Multiple },`,
}

const VALUES: { [field in IAccountField]: string } = {
    name: `name: 'Contoso Ltd.'`,
    telephone1: `telephone1: '+420 123 456 789'`,
    emailaddress1: `emailaddress1: 'info@contoso.com'`,
    websiteurl: `websiteurl: 'https://contoso.com'`,
    industrycode: `industrycode: 2`,
    creditlimit: `creditlimit: 40000`,
    customersince: `customersince: '2019-03-01'`,
    rating: `rating: 4`,
    active: `active: true`,
    description: `description: 'Makes office furniture and sells it through regional dealers.'`,
}

/** The `createMemoryRecord` call for one account with only `fields`, and `extra` lines before its end. */
export const accountRecord = (fields: IAccountField[], extra = '') => `createMemoryRecord({
    columns: [
${fields.map(field => COLUMNS[field]).join('\n')}
    ],
    data: { accountid: '3f2b8c1e-5d4a-4e7b-9c61-2a8f0d7e4b15', ${fields.map(field => VALUES[field]).join(', ')} },
    metadata: { PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name' },
${extra}})`

/** The example's code with the account, holding only `fields`, beside it as *record.ts*. */
export const withRecord = (code: string, fields: IAccountField[], ...files: IGridExampleFile[]): IGridExampleFile[] => [
    { name: 'GridExample.tsx', code },
    ...files,
    { name: 'record.ts', code: `//one account held in memory\nexport const account = ${accountRecord(fields)}\n` },
]
