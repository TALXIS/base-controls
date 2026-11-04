import type { IGridExampleFile } from '../../grid/GridLivePreview'

/** One account held in memory, the record most form examples edit. */
export const RECORD_FILE = `//the fields the form can show, as a data provider's columns
export const ACCOUNT_COLUMNS = [
    //RequiredLevel 2 makes the column required wherever it is edited
    { name: 'name', displayName: 'Account name', dataType: DataTypes.SingleLineText, metadata: { RequiredLevel: 2 } },
    { name: 'telephone1', displayName: 'Phone', dataType: DataTypes.SingleLinePhone },
    { name: 'emailaddress1', displayName: 'Email', dataType: DataTypes.SingleLineEmail },
    { name: 'websiteurl', displayName: 'Website', dataType: DataTypes.SingleLineUrl },
    { name: 'industrycode', displayName: 'Industry', dataType: DataTypes.OptionSet, metadata: { OptionSet: [
        { Value: 1, Label: 'Consulting', Color: '#0078d4' },
        { Value: 2, Label: 'Manufacturing', Color: '#8764b8' },
        { Value: 3, Label: 'Retail', Color: '#038387' },
    ] } },
    { name: 'numberofemployees', displayName: 'Employees', dataType: DataTypes.WholeNone },
    { name: 'creditlimit', displayName: 'Credit limit', dataType: DataTypes.Currency },
    { name: 'customersince', displayName: 'Customer since', dataType: DataTypes.DateAndTimeDateOnly },
    { name: 'rating', displayName: 'Rating', dataType: DataTypes.WholeNone, metadata: { MinValue: 1, MaxValue: 5 } },
    { name: 'active', displayName: 'Active', dataType: DataTypes.TwoOptions, metadata: { OptionSet: [
        { Value: 1, Label: 'Yes', Color: '' },
        { Value: 0, Label: 'No', Color: '' },
    ] } },
    { name: 'description', displayName: 'Description', dataType: DataTypes.Multiple },
]

//the values by column name, as Dataverse returns a record
export const ACCOUNT_DATA = {
    accountid: '3f2b8c1e-5d4a-4e7b-9c61-2a8f0d7e4b15',
    name: 'Contoso Ltd.',
    telephone1: '+420 123 456 789',
    emailaddress1: 'info@contoso.com',
    websiteurl: 'https://contoso.com',
    industrycode: 2,
    numberofemployees: 250,
    creditlimit: 40000,
    customersince: '2019-03-01',
    rating: 4,
    active: true,
    description: 'Makes office furniture and sells it through regional dealers.',
}

export const ACCOUNT_METADATA = { PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name' }

/** A new copy of the account; a save commits it in memory. */
export const createAccount = () => createMemoryRecord({ columns: ACCOUNT_COLUMNS, data: { ...ACCOUNT_DATA }, metadata: ACCOUNT_METADATA })
`

/** The example's code with the account beside it as *record.ts*. */
export const withRecord = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => [
    { name: 'GridExample.tsx', code },
    ...files,
    { name: 'record.ts', code: RECORD_FILE },
]
