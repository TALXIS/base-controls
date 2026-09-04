/** Every localizable string this module renders. Override any subset through its `labels` option. */
export interface IGridGroupingLabels {
    group: string;
    ungroup: string;
    maximumGroupChildrenLimitReached: string;
    /** What a grouped column is named in its header tooltip. Separate from `group`, which is the action. */
    headerTitle: string;
    /** What this module's section of a column's menu is called. */
    menuSection: string;
}

/** The English defaults for {@link IGridGroupingLabels}. */
export const GRID_GROUPING_LABELS: IGridGroupingLabels = {
    group: 'Group',
    ungroup: 'Ungroup',
    maximumGroupChildrenLimitReached: 'The maximum limit of {{maxGroupChildren}} child records has been reached. Records above this limit will not be loaded.',
    headerTitle: 'Group',
    menuSection: 'Grouping',
};
