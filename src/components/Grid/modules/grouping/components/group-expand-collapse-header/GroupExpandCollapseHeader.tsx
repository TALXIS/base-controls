import * as React from "react";
import { IconButton } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useGridService } from "../../../../grid/useGridService";
import { useGridGroupingLabels } from "../../useGridGroupingLabels";
import { getGroupExpandCollapseHeaderStyles } from "./styles";

/**
 * Opens and closes the groups a level at a time.
 *
 * The level lives on the grouping module, which is what the rows are drawn from — this only steps it and
 * asks to be drawn again, so a level set from anywhere else reads correctly here too.
 */
export const GroupExpandCollapseHeader = () => {
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

    return (
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
    );
};
