import dayjs from 'dayjs'
import { DataTypes, IColumn, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { createMemoryProvider, metadataFor, numberMetadataFor } from './metadata'

export const DEAL_PRIMARY_ID = 'docs_dealid'

const STAGE_OPTIONS = [
    { Value: 1, Label: 'Qualify', Color: '#605e5c' },
    { Value: 2, Label: 'Propose', Color: '#0078d4' },
    { Value: 3, Label: 'Negotiate', Color: '#c19c00' },
    { Value: 4, Label: 'Won', Color: '#107c10' },
    { Value: 5, Label: 'Lost', Color: '#a4262c' },
]

//apart from the stage's colours
const PRODUCT_OPTIONS = [
    { Value: 10, Label: 'CRM', Color: '#038387' },
    { Value: 20, Label: 'Support', Color: '#8764b8' },
    { Value: 30, Label: 'Analytics', Color: '#c239b3' },
    { Value: 40, Label: 'Training', Color: '#ca5010' },
]

const RECURRING_OPTIONS = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
    { Value: 1, Label: 'Yes', Color: '#107c10' },
]

export const DEAL_COLUMNS: IColumn[] = [
    { name: 'name', dataType: DataTypes.SingleLineText, displayName: 'Deal', visualSizeFactor: 230, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'owner', dataType: DataTypes.SingleLineText, displayName: 'Account manager', visualSizeFactor: 160, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'stage', dataType: DataTypes.OptionSet, displayName: 'Stage', visualSizeFactor: 130, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: STAGE_OPTIONS } },
    { name: 'products', dataType: DataTypes.MultiSelectOptionSet, displayName: 'Products', visualSizeFactor: 200, metadata: { ...metadataFor(DataTypes.MultiSelectOptionSet), OptionSet: PRODUCT_OPTIONS } },
    { name: 'value', dataType: DataTypes.Currency, displayName: 'Value', visualSizeFactor: 130, metadata: numberMetadataFor(DataTypes.Currency) },
    { name: 'probability', dataType: DataTypes.WholeNone, displayName: 'Probability (%)', visualSizeFactor: 130, metadata: numberMetadataFor(DataTypes.WholeNone) },
    { name: 'closedate', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Close date', visualSizeFactor: 120, metadata: metadataFor(DataTypes.DateAndTimeDateOnly) },
    { name: 'timespent', dataType: DataTypes.WholeDuration, displayName: 'Time spent', visualSizeFactor: 120, metadata: numberMetadataFor(DataTypes.WholeDuration) },
    { name: 'recurring', dataType: DataTypes.TwoOptions, displayName: 'Recurring', visualSizeFactor: 100, metadata: { ...metadataFor(DataTypes.TwoOptions), OptionSet: RECURRING_OPTIONS } },
]

const ACCOUNTS = ['Contoso', 'Fabrikam', 'Northwind', 'Adventure Works', 'Litware', 'Tailspin Toys', 'Woodgrove Bank', 'Proseware', 'Alpine Ski House', 'Wide World Importers']
const DEALS = ['CRM rollout', 'Support renewal', 'Data migration', 'Licence upgrade', 'Onboarding package']
const OWNERS = ['Anna Novak', 'Ben Carter', 'Chloé Martin', 'David Kim']
const PROBABILITIES = [20, 45, 70, 100]
const PRODUCTS = [[10], [10, 20], [30], [20, 40], [10, 30, 40]]
const NOTES = [
    'Waiting on legal.',
    'Champion changed jobs; the new sponsor wants a fresh demo before the budget review, so the timeline may slip into next quarter.',
    'Asked for a discount on the second year.',
    'Pilot went well. Procurement needs three references and a security questionnaire before they sign.',
    'No reply since the last call.',
]
const NEXT_STEPS = ['Send the proposal', 'Book a demo', 'Chase the signature', 'Agree the scope', 'Review the contract']
const LANGUAGES = [1033, 1029, 1031]
const TIME_ZONES = [85, 105, 190]
//a 1x1 PNG, so the logo column has something to show without fetching anything
const PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
//in minutes, as a duration column holds them
const TIME_SPENT = [30, 90, 240, 480, 960, 1440, 2880]

const slugOf = (account: string) => account.toLowerCase().replace(/[^a-z]+/g, '')

const today = dayjs().startOf('day')

export const DEAL_ROWS: IRawRecord[] = Array.from({ length: 30 }, (_, index) => ({
    [DEAL_PRIMARY_ID]: `deal-${index + 1}`,
    name: `${ACCOUNTS[index % ACCOUNTS.length]}: ${DEALS[index % DEALS.length]}`,
    owner: OWNERS[index % OWNERS.length],
    //every ninth deal is lost
    stage: index % 9 === 4 ? 5 : (index % 4) + 1,
    products: PRODUCTS[index % PRODUCTS.length],
    value: 4000 + ((index * 7) % 12) * 2500,
    probability: index % 9 === 4 ? 0 : PROBABILITIES[index % PROBABILITIES.length],
    //close dates fall around the day the page is read
    closedate: index % 6 === 0 ? null : today.add(index * 5 - 35, 'day').toISOString(),
    timespent: TIME_SPENT[index % TIME_SPENT.length],
    recurring: index % 3 !== 0,
    notes: NOTES[index % NOTES.length],
    email: `sales@${slugOf(ACCOUNTS[index % ACCOUNTS.length])}.example`,
    phone: `+420 777 100 ${`${index + 1}`.padStart(3, '0')}`,
    website: `https://www.${slugOf(ACCOUNTS[index % ACCOUNTS.length])}.example`,
    nextstep: NEXT_STEPS[index % NEXT_STEPS.length],
    discount: (index % 5) * 2.5,
    lastcontact: today.subtract(index * 2 + 1, 'day').hour(9 + (index % 8)).minute((index * 7) % 60).toISOString(),
    language: LANGUAGES[index % LANGUAGES.length],
    timezone: TIME_ZONES[index % TIME_ZONES.length],
    contract: `contract-${index + 1}`,
    'contract.filename': `deal-${index + 1}-contract.pdf`,
    'contract.filesizeinbytes': 40960 + index * 1024,
    'contract.mimetype': 'application/pdf',
    'contract.fileurl': `https://example.com/contracts/deal-${index + 1}.pdf`,
    logo: PIXEL,
    'logo.filename': `${slugOf(ACCOUNTS[index % ACCOUNTS.length])}.png`,
    'logo.filesizeinbytes': 68,
    'logo.mimetype': 'image/png',
    'logo.thumbnailurl': `data:image/png;base64,${PIXEL}`,
}))

/** Columns of every other data type, for the examples that show them. */
export const DEAL_DETAIL_COLUMNS: IColumn[] = [
    { name: 'email', dataType: DataTypes.SingleLineEmail, displayName: 'Email', visualSizeFactor: 200, metadata: metadataFor(DataTypes.SingleLineEmail) },
    { name: 'phone', dataType: DataTypes.SingleLinePhone, displayName: 'Phone', visualSizeFactor: 150, metadata: metadataFor(DataTypes.SingleLinePhone) },
    { name: 'website', dataType: DataTypes.SingleLineUrl, displayName: 'Website', visualSizeFactor: 200, metadata: metadataFor(DataTypes.SingleLineUrl) },
    { name: 'nextstep', dataType: DataTypes.SingleLineTextArea, displayName: 'Next step', visualSizeFactor: 170, metadata: metadataFor(DataTypes.SingleLineTextArea) },
    { name: 'discount', dataType: DataTypes.Decimal, displayName: 'Discount (%)', visualSizeFactor: 120, metadata: { ...numberMetadataFor(DataTypes.Decimal), Precision: 1 } },
    { name: 'lastcontact', dataType: DataTypes.DateAndTimeDateAndTime, displayName: 'Last contact', visualSizeFactor: 170, metadata: metadataFor(DataTypes.DateAndTimeDateAndTime) },
    { name: 'language', dataType: DataTypes.WholeLanguage, displayName: 'Language', visualSizeFactor: 110, metadata: metadataFor(DataTypes.WholeLanguage) },
    { name: 'timezone', dataType: DataTypes.WholeTimeZone, displayName: 'Time zone', visualSizeFactor: 110, metadata: metadataFor(DataTypes.WholeTimeZone) },
    { name: 'contract', dataType: DataTypes.File, displayName: 'Contract', visualSizeFactor: 190, metadata: metadataFor(DataTypes.File) },
    { name: 'logo', dataType: DataTypes.Image, displayName: 'Logo', visualSizeFactor: 90, metadata: metadataFor(DataTypes.Image) },
    { name: 'notes', dataType: DataTypes.Multiple, displayName: 'Notes', visualSizeFactor: 280, metadata: metadataFor(DataTypes.Multiple) },
]

/** A sales pipeline of 30 deals, not yet loaded. */
export const createDealsProvider = (): MemoryDataProvider => createMemoryProvider({
    primaryIdAttribute: DEAL_PRIMARY_ID,
    primaryNameAttribute: 'name',
    logicalName: 'docs_deal',
    rows: DEAL_ROWS,
    columns: DEAL_COLUMNS,
})
