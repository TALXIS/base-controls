import { GroupingUiExpandCollapse } from './expand-collapse';

export * from './expand-collapse';

/** What draws grouping, and nothing that knows which groups. */
export interface IGroupingUi {
    ExpandCollapse: typeof GroupingUiExpandCollapse;
}

export const GroupingUi: IGroupingUi = {
    ExpandCollapse: GroupingUiExpandCollapse,
};
