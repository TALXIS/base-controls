import { ICellRendererParams } from "ag-grid-community";
import { CellField } from "../../../grid/adapters/cells/field/CellField";
import { CellRoot } from "../../../grid/adapters/cells/root/CellRoot";
import { CellTheme } from "../../../grid/adapters/cells/theme/CellTheme";
import { CellContainer } from "../../../grid/adapters/cells/container/CellContainer";
import { CellControl } from "../../../grid/adapters/cells/control/CellControl";
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
