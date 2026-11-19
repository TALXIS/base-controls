import type { IGridExampleFile } from '../GridLivePreview'

export { DEAL_LIST_TABS, DEALS_RIBBON_FILE } from '../../dataset-control/guide/dealListFiles'

//first has no rules; checked marks the rules and the refusal as new
type DealsFileStage = 'first' | 'checked' | 'final'

const createDealsFile = (stage: DealsFileStage): IGridExampleFile => {
    const hasRules = stage !== 'first'
    const comment = (text: string) => stage === 'checked' ? `//new: ${text}` : `//${text}`
    const rules = `${comment('what the CRM allows in each column')}
const RULES: { [columnName: string]: IAttributeMetadata } = {
    //every deal needs a name
    name: { RequiredLevel: 2 },
    //the CRM assigns the account manager
    owner: { IsValidForUpdate: false },
    probability: { MinValue: 0, MaxValue: 100 },
}

`
    const columnReturn = hasRules
        ? `${stage === 'checked' ? `    ${comment('each column with the CRM\'s rules')}\n` : ''}    return { ...column, order, metadata: { ...column.metadata, ...RULES[name] } }`
        : '    return { ...column, order, metadata: { ...column.metadata } }'
    const maxDiscount = `${stage === 'checked' ? `${comment('the most the CRM approves')}\n` : ''}const MAX_DISCOUNT = 20

`
    const refusal = `        ${comment('the CRM refuses a discount the sales director has not approved')}
        if (Number(deal.getValue('discount')) > MAX_DISCOUNT) {
            return { recordId: deal.getRecordId(), success: false, fields: [], errors: [{ fieldName: 'discount', message: 'A discount over 20% needs the sales director to approve it.' }] }
        }
`
    return {
        name: 'deals.ts',
        code: `import { IDatasetControlLoadResult } from '@talxis/base-controls'
import { ${hasRules ? 'IAttributeMetadata, ' : ''}IColumn, IMemoryProviderEntityMetadata, IRecord, IRecordSaveOperationResult, MemoryDataProvider } from '@talxis/client-libraries'

//the docs dataset's deals, kept outside onLoad so a saved value stays
export const deals = DEAL_ROWS.map(row => ({ ...row }))

export const metadata: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal' }

//the columns the grid shows, in this order
const COLUMN_NAMES = ['name', 'owner', 'stage', 'value', 'discount', 'probability', 'closedate', 'recurring', 'nextstep', 'notes']

${hasRules ? rules : ''}//a copy of each column for the provider to write into
export const dealColumns: IColumn[] = COLUMN_NAMES.map((name, order) => {
    const column = [...DEAL_COLUMNS, ...DEAL_DETAIL_COLUMNS].find(candidate => candidate.name === name)!
${columnReturn}
})

${hasRules ? maxDiscount : ''}//stands in for a slow CRM
export class DealsProvider extends MemoryDataProvider {
    public async onRecordSave(deal: IRecord): Promise<IRecordSaveOperationResult> {
        await new Promise(resolve => setTimeout(resolve, 600))
${hasRules ? refusal : ''}        return super.onRecordSave(deal)
    }
}

//called on every load for the provider the grid draws
export const loadDeals = async (): Promise<IDatasetControlLoadResult> => ({ provider: new DealsProvider({ dataSource: deals, metadata, columns: dealColumns }) })
`,
    }
}

/** The deals of Basics' first two steps, with no rules and no refusal. */
export const FIRST_DEALS_FILE = createDealsFile('first')

/** The deals with the CRM's rules and refusal marked as new, for Check what users enter. */
export const CHECKED_DEALS_FILE = createDealsFile('checked')

/** The deals, their columns with the CRM's rules, the provider and the loader every load calls. */
export const DEALS_FILE = createDealsFile('final')

/** The entry, then the deals unless `files` holds a deals.ts of its own, then the other files. */
export const withDealGrid = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => {
    const dealsFile = files.find(file => file.name === DEALS_FILE.name) ?? DEALS_FILE
    return [{ name: 'GridExample.tsx', code }, dealsFile, ...files.filter(file => file !== dealsFile)]
}
