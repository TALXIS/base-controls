import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const DEAL_PARTS_FILE: IGridExampleFile = {
    name: 'dealParts.tsx',
    code: `//the office photos the products example uses
const PHOTO_IDS = ['1571624436279-b272aff752b5', '1532622785990-d2c36a76f5a6', '1623177623442-979c1e42c255', '1593430980369-68efc5a5eb34', '1540932239986-30128078f3c5', '1702471896913-97a7e7f59745', '1688578735427-994ecdea3ea4', '1569235186275-626cb53b83ce']

const AVATAR_COLORS = ['#0f6cbd', '#8764b8', '#038387', '#ca5010']

/** The account a deal is for, the part of its name before the colon. */
export const getAccount = (deal: IRecord): string => deal.getValue('name').split(':')[0]

/** A photo of the deal's account, the same for every deal of the account. */
export const getDealPhoto = (deal: IRecord): string => {
    const account = getAccount(deal)
    const hash = [...account].reduce((sum, character) => sum + character.charCodeAt(0), 0)
    return \`https://images.unsplash.com/photo-\${PHOTO_IDS[hash % PHOTO_IDS.length]}?w=480&h=280&fit=crop&auto=format\`
}

const styles = mergeStyleSets({
    avatar: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff', fontWeight: 600, flexShrink: 0 },
    card: { border: '1px solid #edebe9', borderRadius: 6, background: '#fff', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.06)', selectors: { ':hover': { boxShadow: '0 2px 8px rgba(0,0,0,.12)' } } },
    selected: { outline: '2px solid #0f6cbd', outlineOffset: -2 },
})

export const OwnerAvatar = (props: { owner: string, size?: number }) => {
    const size = props.size ?? 28
    const initials = props.owner.split(' ').map(part => part[0]).join('')
    const color = AVATAR_COLORS[[...props.owner].reduce((sum, character) => sum + character.charCodeAt(0), 0) % AVATAR_COLORS.length]
    return <span className={styles.avatar} title={props.owner} style={{ width: size, height: size, fontSize: size * 0.4, background: color }}>{initials}</span>
}

/** The deals and their selection, drawn again when either changes. */
export const useDeals = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onRecordsSelected', 'onRecordColumnValueChanged'])
    const selectedIds = provider.getSelectedRecordIds()
    const toggle = (ids: string[]) => {
        const isSelected = ids.every(id => selectedIds.includes(id))
        provider.setSelectedRecordIds(isSelected ? selectedIds.filter(id => !ids.includes(id)) : [...new Set([...selectedIds, ...ids])])
    }
    return { deals: provider.getRecords(), isSelected: (id: string) => selectedIds.includes(id), toggle }
}

/** A clickable card that shows whether it is selected. */
export const DealCard = (props: { isSelected: boolean, onClick: () => void, className?: string, children: React.ReactNode }) =>
    <div className={[styles.card, props.isSelected ? styles.selected : '', props.className ?? ''].join(' ')} onClick={props.onClick}>{props.children}</div>
`,
}
