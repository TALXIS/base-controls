import { useRerender } from "@legacy";
import { useGridService } from "../../../../useGridService";
import { ColumnHeaderRoot, IColumnHeaderParams } from "../../../../components/column-header/root/ColumnHeaderRoot";
import { ColumnHeaderTheme } from "../../../../components/column-header/theme/ColumnHeaderTheme";
import { useGridGroupingLabels } from "../../useGridGroupingLabels";
import { GroupingUi } from "../ui";

export interface IGroupExpansionHeaderProps extends IColumnHeaderParams { }

/** Opens and closes the groups a level at a time. */
export const GroupExpansionHeader = (props: IGroupExpansionHeaderProps) => {
    //the grouping module is registered wherever this header draws
    const grouping = useGridService('grouping')!;
    const labels = useGridGroupingLabels();
    const { rerender } = useRerender();
    const expandedLevel = grouping.getExpandedLevel();

    const onStepLevel = (step: number) => {
        grouping.setExpandedLevel(expandedLevel + step);
        rerender();
    };

    //no container: it draws the menu button this column lacks
    return <ColumnHeaderRoot {...props}>
        <ColumnHeaderTheme>
            <GroupingUi.ExpandCollapse
                expandTitle={labels.getLocalizedString('expandLevel')}
                collapseTitle={labels.getLocalizedString('collapseLevel')}
                canExpand={expandedLevel < grouping.getDeepestLevel()}
                canCollapse={expandedLevel >= 0}
                onExpand={() => onStepLevel(1)}
                onCollapse={() => onStepLevel(-1)}
                components={grouping.components.expansionHeader?.expandCollapse} />
        </ColumnHeaderTheme>
    </ColumnHeaderRoot>;
};
