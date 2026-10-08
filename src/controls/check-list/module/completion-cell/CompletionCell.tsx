import { ICellRendererParams } from "ag-grid-community";
import { CellField } from "../../../grid/components/cells/field/CellField";
import { CellRoot } from "../../../grid/components/cells/root/CellRoot";
import { CellTheme } from "../../../grid/components/cells/theme/CellTheme";
import { CellContainer } from "../../../grid/components/cells/container/CellContainer";
import { CellControl } from "../../../grid/components/cells/control/CellControl";
import { CompletionCheckbox } from "../completion-checkbox";

/** The cell an item is ticked off in. */
export const CompletionCell = (props: ICellRendererParams) => <CellField record={props.data} name={props.colDef!.colId!}>
    <CellRoot {...props}>
        <CellTheme>
            <CellContainer>
                <CellControl>
                    <CompletionCheckbox />
                </CellControl>
            </CellContainer>
        </CellTheme>
    </CellRoot>
</CellField>;
