import { Checkbox, useTheme } from "@fluentui/react";
import React, { useMemo, useState } from "react";
import { useSelectionController } from "../../../../../selection/controllers/useSelectionController";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { getGlobalCheckboxStyles } from "./styles";
import { useRerender } from "../../../../../../../hooks/useRerender";

export const GlobalCheckBox = () => {
    const grid = useGridInstance();
    const theme = useTheme();
    const styles = getGlobalCheckboxStyles(theme);
    const selection = useSelectionController();
    //TODO: why does useRerender not work?
    const [_, rerender] = useState(0)

    useMemo(() => {
        grid.setRefreshGlobalCheckBox(() => rerender((previous) => previous + 1))
    }, []);

    if(grid.dataset.sortedRecordIds.length === 0) {
        return <></>
    }
    return (
        <div className={styles.root}>
            {selection.type === 'multiple' &&
                <Checkbox
                    checked={selection.allRecordsSelected}
                    indeterminate={selection.selectedRecordIds.length > 0 && !selection.allRecordsSelected}
                    onChange={(e, checked) => {
                        if(checked) {
                            selection.selectAll()
                            return;
                        }
                        selection.clear();
                    }} />
            }
        </div>
    )
};