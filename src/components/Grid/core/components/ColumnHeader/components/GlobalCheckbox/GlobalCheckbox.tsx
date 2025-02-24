import { Checkbox, useTheme } from "@fluentui/react";
import { useContext } from "react";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { getGlobalCheckboxStyles } from "./styles";
import { AgGridContext } from "../../../AgGrid/context";

interface IGlobalCheckBox {
    checkboxState: 'checked' | 'unchecked' | 'intermediate'
}

export const GlobalCheckBox = (props: IGlobalCheckBox) => {
    const grid = useGridInstance();
    const theme = useTheme();
    const styles = getGlobalCheckboxStyles(theme);
    const selection = grid.selection;
    const agGrid = useContext(AgGridContext);
    const checkboxState = props.checkboxState;

    if(grid.dataset.sortedRecordIds.length === 0) {
        return <></>
    }
    return (
        <div className={styles.root}>
            {selection.type === 'multiple' &&
                <Checkbox
                    checked={checkboxState === 'checked'}
                    styles={{
                        checkbox: styles.checkbox
                    }}
                    indeterminate={checkboxState === 'intermediate'}
                    onChange={(e, checked) => {
                        if(checked) {
                            selection.selectAll();
                        }
                        else {
                            selection.clear();
                        }
                        agGrid.refreshRowSelection();
                    }} />
            }
        </div>
    )
};