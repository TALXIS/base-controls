import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const DEALS_BODY_FILE: IGridExampleFile = {
    name: 'DealsBody.tsx',
    code: `import { DealLayout, getCurrentView, getDefinition } from './views'
import { DealGallery } from './DealGallery'
import { DealBoard } from './DealBoard'
import { DealTimeline } from './DealTimeline'
import { OwnerLeaderboard } from './OwnerLeaderboard'

const DealGrid = () => {
    const modules = React.useMemo(() => ({
        rowModel: createClientSideRowModelModule(),
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }), [])
    return <Grid stateKey='grid' modules={modules} />
}

const LAYOUTS: { [layout in DealLayout]: () => JSX.Element } = {
    grid: DealGrid,
    gallery: DealGallery,
    board: DealBoard,
    timeline: DealTimeline,
    leaderboard: OwnerLeaderboard,
}

//the control mounts anew for every view, so the layout is read once
export const DealsBody = () => {
    const control = useDatasetControl()
    const Layout = React.useMemo(() => LAYOUTS[getDefinition(getCurrentView(control)).layout ?? 'grid'], [])
    return <Layout />
}
`,
}
