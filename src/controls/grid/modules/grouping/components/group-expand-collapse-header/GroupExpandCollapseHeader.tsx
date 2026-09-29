import * as React from "react";
import { IconButton } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useGridService } from "../../../../useGridService";
import { Grid } from "../../../../namespace";
import { IColumnHeaderParams } from "../../../../components/column-header/root/ColumnHeaderRoot";
import { useGridGroupingLabels } from "../../useGridGroupingLabels";
import { getGroupExpandCollapseHeaderStyles } from "./styles";

/** Opens and closes the groups a level at a time. */
export const GroupExpandCollapseHeader = (props: IColumnHeaderParams) => {
    const styles = React.useMemo(() => getGroupExpandCollapseHeaderStyles(), []);
    //the grouping module is registered wherever this header draws
    const grouping = useGridService('grouping')!;
    const labels = useGridGroupingLabels();
    const rerender = useRerender();
    const expandedLevel = grouping.getExpandedLevel();

    const onStepLevel = (step: number) => {
        grouping.setExpandedLevel(expandedLevel + step);
        rerender();
    };

    //no container: it draws the menu button this column lacks
    return <Grid.ColumnHeader.Root {...props}>
        <Grid.ColumnHeader.Theme>
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
        </Grid.ColumnHeader.Theme>
    </Grid.ColumnHeader.Root>;
};
