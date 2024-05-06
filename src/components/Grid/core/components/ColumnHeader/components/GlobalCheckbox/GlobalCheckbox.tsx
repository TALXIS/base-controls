import { Checkbox, useTheme } from "@fluentui/react";
import React, { useContext } from "react";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { getGlobalCheckboxStyles } from "./styles";

export const GlobalCheckBox = () => {
    const grid = useGridInstance();
    const theme = useTheme();
    const styles = getGlobalCheckboxStyles(theme);
    const isChecked = () => {
        if(grid.dataset.getSelectedRecordIds().length === 0) {
            return false;
        }
        return true;
        //return Object.entries(dataset.records).length === dataset.getSelectedRecordIds().length;
    }
    return (
        <div className={styles.root}>
            {grid.props.parameters.SelectableRows?.raw === 'multiple' &&
                <Checkbox
                    checked={isChecked()}
                    onChange={(e, checked) => {
                        //gridContext.onRowSelectionChanged(checked ? dataset.sortedRecordIds : []);
                    }} />
            }
        </div>
    )
};