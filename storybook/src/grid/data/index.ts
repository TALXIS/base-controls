import type { MemoryDataProvider } from '@talxis/client-libraries'
import { createDealsProvider } from './deals'
import { createProductsProvider } from './products'
import { createTicketsProvider } from './tickets'
import { createTimesheetsProvider } from './timesheets'

export * from './deals'
export * from './products'
export * from './tickets'
export * from './timesheets'

const DATASETS = {
    deals: createDealsProvider,
    timesheets: createTimesheetsProvider,
    tickets: createTicketsProvider,
    products: createProductsProvider,
}

/** The datasets the live examples are handed. */
export type IGridDocsDataset = keyof typeof DATASETS

/** A provider over the named dataset, loaded. */
export const createDocsDataset = (dataset: IGridDocsDataset): MemoryDataProvider => {
    const provider = DATASETS[dataset]()
    provider.refresh()
    return provider
}
