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
    return (
        <div className={styles.root}>
            {selection.type === 'multiple' &&
                <Checkbox
                    checked={selection.allRecordsSelected}
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