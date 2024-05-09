import { Checkbox, useTheme } from "@fluentui/react";
import React from "react";
import { useSelectionController } from "../../../../../selection/controllers/useSelectionController";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { getGlobalCheckboxStyles } from "./styles";

export const GlobalCheckBox = () => {
    const grid = useGridInstance();
    const theme = useTheme();
    const styles = getGlobalCheckboxStyles(theme);
    const selection = useSelectionController();
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