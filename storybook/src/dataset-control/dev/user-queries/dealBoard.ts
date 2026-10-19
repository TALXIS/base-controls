import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const DEAL_BOARD_FILE: IGridExampleFile = {
    name: 'DealBoard.tsx',
    code: `import { DealCard, getAccount, OwnerAvatar, useDeals } from './dealParts'

const styles = mergeStyleSets({
    board: { display: 'flex', gap: 12, height: '100%', overflowX: 'auto', paddingBottom: 8, boxSizing: 'border-box' },
    column: { flex: '0 0 240px', display: 'flex', flexDirection: 'column', background: '#f3f2f1', borderRadius: 8, minHeight: 0 },
    header: { padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    cards: { flex: 1, overflowY: 'auto', padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 8 },
    card: { padding: 10, display: 'flex', flexDirection: 'column', gap: 6 },
    footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
})

//the deals in a column per stage; clicking a card selects it
export const DealBoard = () => {
    const { deals, isSelected, toggle } = useDeals()
    const stages = new Map<number, { label: string, deals: IRecord[] }>()
    for (const deal of deals) {
        const stage = deal.getValue('stage')
        const column = stages.get(stage) ?? { label: deal.getFormattedValue('stage'), deals: [] }
        column.deals.push(deal)
        stages.set(stage, column)
    }

    return <div className={styles.board}>
        {[...stages.entries()].sort(([a], [b]) => a - b).map(([stage, column]) => <div key={stage} className={styles.column}>
            <div className={styles.header}>
                <Text styles={{ root: { fontWeight: 600 } }}>{column.label}</Text>
                <Text variant='small'>{column.deals.length}</Text>
            </div>
            <div className={styles.cards}>
                {column.deals.map(deal => <DealCard key={deal.getRecordId()} className={styles.card} isSelected={isSelected(deal.getRecordId())} onClick={() => toggle([deal.getRecordId()])}>
                    <Text variant='small'>{getAccount(deal)}</Text>
                    <Text styles={{ root: { fontWeight: 600 } }}>{deal.getFormattedValue('name').split(': ')[1]}</Text>
                    <div className={styles.footer}>
                        <Text>{deal.getFormattedValue('value')}</Text>
                        <OwnerAvatar owner={deal.getValue('owner')} size={24} />
                    </div>
                </DealCard>)}
            </div>
        </div>)}
    </div>
}
`,
}
