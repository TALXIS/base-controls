import { Checkbox, useTheme } from "@fluentui/react";
import { useContext, useMemo } from "react";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { getGlobalCheckboxStyles } from "./styles";
import { useRerender } from "@talxis/react-components";
import { AgGridContext } from "../../../AgGrid/context";

export const GlobalCheckBox = () => {
    const grid = useGridInstance();
    const theme = useTheme();
    const styles = getGlobalCheckboxStyles(theme);
    const rerender = useRerender();
    const selection = grid.selection;
    const agGrid = useContext(AgGridContext);

    useMemo(() => {
        agGrid.setRefreshGlobalCheckBoxCallback(() => rerender());
    }, []);

    if(grid.dataset.sortedRecordIds.length === 0) {
        return <></>
    }
    return (
        <div className={styles.root}>
            {selection.type === 'multiple' &&
                <Checkbox
                    checked={selection.allRecordsSelected}
                    styles={{
                        checkbox: styles.checkbox
                    }}
                    indeterminate={selection.selectedRecordIds.length > 0 && !selection.allRecordsSelected}
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