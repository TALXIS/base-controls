import * as React from "react";
import { IconButton } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useGridService } from "../../../../useGridService";
import { ColumnHeaderRoot, IColumnHeaderParams } from "../../../../components/column-header/root/ColumnHeaderRoot";
import { ColumnHeaderTheme } from "../../../../components/column-header/theme/ColumnHeaderTheme";
import { useGridGroupingLabels } from "../../useGridGroupingLabels";
import { getGroupExpandCollapseHeaderStyles } from "./styles";
import { Theming } from "@theme";

/** Opens and closes the groups a level at a time. */
export const GroupExpandCollapseHeader = (props: IColumnHeaderParams) => {
    const styles = React.useMemo(() => getGroupExpandCollapseHeaderStyles(), []);
    //this header is a column of the grouping module's own, so the module is there
    const grouping = useGridService('grouping')!;
    const labels = useGridGroupingLabels();
    const rerender = useRerender();
    const expandedLevel = grouping.getExpandedLevel();

    const onStepLevel = (step: number) => {
        grouping.setExpandedLevel(expandedLevel + step);
        rerender();
    };

    //no container: what that part draws is the button a column's menu opens from, and this column has none
    return <ColumnHeaderRoot {...props}>
        <ColumnHeaderTheme>
            <div className={styles.root}>
                <IconButton
                    title={labels.getLocalizedString('expandLevel')}
                    disabled={expandedLevel >= grouping.getDeepestLevel()}
                    styles={{ root: styles.button }}
                    iconProps={{ iconName: 'Add', styles: { root: styles.icon } }}
                    onClick={() => onStepLevel(1)} />
                <IconButton
                    title={labels.getLocalizedString('collapseLevel')}
                    disabled={expandedLevel < 0}
                    styles={{ root: styles.button }}
                    iconProps={{ iconName: 'Remove', styles: { root: styles.icon } }}
                    onClick={() => onStepLevel(-1)} />
            </div>
        </ColumnHeaderTheme>
    </ColumnHeaderRoot>;
};
