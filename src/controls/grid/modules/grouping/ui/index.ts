import { GroupingUiExpandCollapse } from './expand-collapse';
import { GroupingUiToggle } from './toggle';
import { GroupingUiCount } from './count';

export * from './expand-collapse';
export * from './toggle';
export * from './count';

/** What draws grouping, and nothing that knows which groups. */
export interface IGroupingUi {
    ExpandCollapse: typeof GroupingUiExpandCollapse;
    Toggle: typeof GroupingUiToggle;
    Count: typeof GroupingUiCount;
}

export const GroupingUi: IGroupingUi = {
    ExpandCollapse: GroupingUiExpandCollapse,
    Toggle: GroupingUiToggle,
    Count: GroupingUiCount,
};
