import { FilteringUiCallout } from './callout';

export * from './callout';

/** What draws filtering, and nothing that knows which column. */
export interface IFilteringUi {
    Callout: typeof FilteringUiCallout;
}

export const FilteringUi: IFilteringUi = {
    Callout: FilteringUiCallout,
};
