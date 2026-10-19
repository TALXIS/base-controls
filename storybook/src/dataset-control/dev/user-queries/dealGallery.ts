import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const DEAL_GALLERY_FILE: IGridExampleFile = {
    name: 'DealGallery.tsx',
    code: `import { DealCard, getDealPhoto, OwnerAvatar, useDeals } from './dealParts'

const styles = mergeStyleSets({
    gallery: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', alignContent: 'start', gap: 16, padding: '4px 2px 16px', height: '100%', overflow: 'auto', boxSizing: 'border-box' },
    card: { overflow: 'hidden' },
    photo: { display: 'block', width: '100%', height: 130, objectFit: 'cover' },
    details: { padding: 12, display: 'flex', flexDirection: 'column', gap: 6 },
    footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    stage: { fontSize: 12, padding: '2px 8px', borderRadius: 10, background: '#f3f2f1' },
})

//the deals as photo cards; clicking a card selects it
export const DealGallery = () => {
    const { deals, isSelected, toggle } = useDeals()

    return <div className={styles.gallery}>
        {deals.map(deal => <DealCard key={deal.getRecordId()} className={styles.card} isSelected={isSelected(deal.getRecordId())} onClick={() => toggle([deal.getRecordId()])}>
            <img className={styles.photo} src={getDealPhoto(deal)} alt='' loading='lazy' />
            <div className={styles.details}>
                <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }} block nowrap>{deal.getFormattedValue('name')}</Text>
                <Text variant='large'>{deal.getFormattedValue('value')}</Text>
                <div className={styles.footer}>
                    <OwnerAvatar owner={deal.getValue('owner')} />
                    <span className={styles.stage}>{deal.getFormattedValue('stage')}</span>
                </div>
            </div>
        </DealCard>)}
    </div>
}
`,
}
