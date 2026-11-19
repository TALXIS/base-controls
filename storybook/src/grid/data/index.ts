import type { MemoryDataProvider } from '@talxis/client-libraries'
import { createDealsProvider } from './deals'
import { createLaunchPlanProvider } from './launchPlan'
import { createTicketsProvider } from './tickets'

export * from './deals'
export * from './launchPlan'
export * from './tickets'

const DATASETS = {
    deals: createDealsProvider,
    tickets: createTicketsProvider,
    launchPlan: createLaunchPlanProvider,
}

/** The datasets the live examples are handed. */
export type IGridDocsDataset = keyof typeof DATASETS

/** A provider over the named dataset, loaded. */
export const createDocsDataset = (dataset: IGridDocsDataset): MemoryDataProvider => {
    const provider = DATASETS[dataset]()
    provider.refresh()
    return provider
}
