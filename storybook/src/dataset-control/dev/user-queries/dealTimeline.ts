import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const DEAL_TIMELINE_FILE: IGridExampleFile = {
    name: 'DealTimeline.tsx',
    code: `import { DealCard, OwnerAvatar, useDeals } from './dealParts'

const NO_DATE = 'No close date'

const styles = mergeStyleSets({
    timeline: { height: '100%', overflowY: 'auto', padding: '4px 4px 16px', boxSizing: 'border-box' },
    month: { margin: '16px 0 8px', selectors: { ':first-child': { marginTop: 0 } } },
    item: { display: 'flex', gap: 12, alignItems: 'stretch', marginLeft: 8, paddingLeft: 16, borderLeft: '2px solid #c8c6c4' },
    date: { width: 52, flexShrink: 0, textAlign: 'center', paddingTop: 10 },
    card: { flex: 1, padding: '8px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 },
    name: { flex: 1, minWidth: 0 },
    overdue: { color: '#a4262c' },
})

//the deals along their close dates, month by month; clicking a deal selects it
export const DealTimeline = () => {
    const { deals, isSelected, toggle } = useDeals()
    const sorted = [...deals].sort((a, b) => (a.getValue('closedate') ?? '9999').localeCompare(b.getValue('closedate') ?? '9999'))
    const months = new Map<string, IRecord[]>()
    for (const deal of sorted) {
        const date = deal.getValue('closedate')
        const month = date ? dayjs(date).format('MMMM YYYY') : NO_DATE
        months.set(month, [...months.get(month) ?? [], deal])
    }

    return <div className={styles.timeline}>
        {[...months.entries()].map(([month, monthDeals]) => <React.Fragment key={month}>
            <Text variant='large' block className={styles.month}>{month}</Text>
            {monthDeals.map(deal => {
                const date = deal.getValue('closedate')
                const isOverdue = !!date && dayjs(date).isBefore(dayjs(), 'day') && deal.getValue('stage') < 4
                return <div key={deal.getRecordId()} className={styles.item}>
                    <div className={styles.date}>
                        <Text variant='small' className={isOverdue ? styles.overdue : undefined}>{date ? dayjs(date).format('D MMM') : '—'}</Text>
                    </div>
                    <DealCard className={styles.card} isSelected={isSelected(deal.getRecordId())} onClick={() => toggle([deal.getRecordId()])}>
                        <OwnerAvatar owner={deal.getValue('owner')} />
                        <div className={styles.name}>
                            <Text block nowrap styles={{ root: { fontWeight: 600 } }}>{deal.getFormattedValue('name')}</Text>
                            <Text variant='small' className={isOverdue ? styles.overdue : undefined}>{isOverdue ? 'Overdue · ' : ''}{deal.getFormattedValue('stage')}</Text>
                        </div>
                        <Text>{deal.getFormattedValue('value')}</Text>
                    </DealCard>
                </div>
            })}
        </React.Fragment>)}
    </div>
}
`,
}
