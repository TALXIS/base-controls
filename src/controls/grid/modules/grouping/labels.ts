import { defineLabels } from "@utils";

/** Every localizable string this module renders. */
export const GRID_GROUPING_LABELS = defineLabels({
    'gridGrouping.group': 'Group',
    'gridGrouping.ungroup': 'Ungroup',
    'gridGrouping.maximumGroupChildrenLimitReached': 'The maximum limit of {{maxGroupChildren}} child records has been reached. Records above this limit will not be loaded.',
    /** What a grouped column is named in its header tooltip. */
    'gridGrouping.headerTitle': 'Group',
    /** What this module's section of a column's menu is called. */
    'gridGrouping.menuSection': 'Grouping',
    /** What opening one more level of groups is called. */
    'gridGrouping.expandLevel': 'Expand one level',
    /** What closing one level of groups is called. */
    'gridGrouping.collapseLevel': 'Collapse one level',
    /** What a selection refused for loading too many groups says. */
    'gridGrouping.groupSelectionLimitMessage': 'This selection would load the records of more than {{maxGroupLoads}} groups. Select fewer groups, or expand them and select their records.',
    'gridGrouping.groupSelectionLimitConfirm': 'OK',
});
