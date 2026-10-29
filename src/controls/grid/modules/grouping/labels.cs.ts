import { translateLabels } from "@utils";
import { GRID_GROUPING_LABELS } from "./labels";

export const GRID_GROUPING_LABELS_CS = translateLabels(GRID_GROUPING_LABELS, {
    'gridGrouping.group': 'Seskupit',
    'gridGrouping.ungroup': 'Zrušit seskupení',
    'gridGrouping.maximumGroupChildrenLimitReached': 'Bylo dosaženo maximálního limitu {{maxGroupChildren}} podřízených záznamů. Záznamy nad tento limit nebudou načteny.',
    'gridGrouping.headerTitle': 'Skupina',
    'gridGrouping.menuSection': 'Seskupení',
    'gridGrouping.expandLevel': 'Rozbalit o jednu úroveň',
    'gridGrouping.collapseLevel': 'Sbalit o jednu úroveň',
    'gridGrouping.groupSelectionLimitMessage': 'Tento výběr by načetl záznamy více než {{maxGroupLoads}} skupin. Vyberte méně skupin, nebo je rozbalte a vyberte jejich záznamy.',
    'gridGrouping.groupSelectionLimitConfirm': 'OK',
});
