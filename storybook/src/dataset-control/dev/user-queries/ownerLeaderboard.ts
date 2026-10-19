import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const OWNER_LEADERBOARD_FILE: IGridExampleFile = {
    name: 'OwnerLeaderboard.tsx',
    code: `import { DealCard, OwnerAvatar, useDeals } from './dealParts'

const WON = 4

const styles = mergeStyleSets({
    leaderboard: { height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 2px 16px', boxSizing: 'border-box' },
    row: { display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px' },
    rank: { width: 24, fontSize: 20, fontWeight: 600, color: '#8a8886' },
    owner: { width: 180, flexShrink: 0 },
    bar: { flex: 1, height: 10, borderRadius: 5, background: '#f3f2f1', overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, #0f6cbd, #8764b8)' },
    total: { width: 110, textAlign: 'right' },
})

//the account managers ranked by what their deals are worth; clicking one selects their deals
export const OwnerLeaderboard = () => {
    const { deals, isSelected, toggle } = useDeals()
    const owners = new Map<string, { total: number, won: number, ids: string[] }>()
    for (const deal of deals) {
        const owner = owners.get(deal.getValue('owner')) ?? { total: 0, won: 0, ids: [] }
        owner.total += deal.getValue('value')
        owner.won += deal.getValue('stage') === WON ? 1 : 0
        owner.ids.push(deal.getRecordId())
        owners.set(deal.getValue('owner'), owner)
    }
    const ranked = [...owners.entries()].sort(([, a], [, b]) => b.total - a.total)
    const best = ranked[0]?.[1].total ?? 1

    return <div className={styles.leaderboard}>
        {ranked.map(([name, owner], index) => <DealCard key={name} className={styles.row} isSelected={owner.ids.every(isSelected)} onClick={() => toggle(owner.ids)}>
            <span className={styles.rank}>{index + 1}</span>
            <OwnerAvatar owner={name} size={36} />
            <div className={styles.owner}>
                <Text block styles={{ root: { fontWeight: 600 } }}>{name}</Text>
                <Text variant='small'>{owner.ids.length} deals · {owner.won} won</Text>
            </div>
            <div className={styles.bar}><div className={styles.fill} style={{ width: \`\${owner.total / best * 100}%\` }} /></div>
            <Text variant='large' className={styles.total}>{owner.total.toLocaleString()}</Text>
        </DealCard>)}
    </div>
}
`,
}
