import { ICellRendererParams } from "@ag-grid-community/core";
import { ITheme } from "@theme";
import { CellCommands } from "../../../../components/cells/commands/CellCommands";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellControl } from "../../../../components/cells/control/CellControl";
import { CellFieldError } from "../../../../components/cells/field-error/CellFieldError";
import { CellLoading } from "../../../../components/cells/loading/CellLoading";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellResizeGrip } from "../../../../components/cells/resize-grip/CellResizeGrip";
import { hasResizeGrip } from "../../../../components/cells/resize-grip/hasResizeGrip";
import { CellRoot } from "../root/CellRoot";
import { CellLockIcon } from "../lock-icon/CellLockIcon";
import { ICellRendererComponents } from "./components";

export interface ICellRendererProps extends ICellRendererParams {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
    components?: ICellRendererComponents;
}

/** A cell of the grid that also says when it is locked for its record. */
export const CellRenderer = (props: ICellRendererProps) => {
    const components = props.components ?? {};
    const content = <CellContainer components={components.container}>
        <CellLoading components={components.loading}>
            <CellLockIcon components={components.lockIcon} />
            <CellControl components={components.control} />
            <CellCommands components={components.commands} />
            <CellFieldError components={components.fieldError} />
        </CellLoading>
    </CellContainer>;

    return <CellRoot {...props}>
        <CellTheme theme={props.theme}>
            {hasResizeGrip(props.colDef)
                ? <CellResizeGrip components={components.resizeGrip}>{content}</CellResizeGrip>
                : content}
        </CellTheme>
    </CellRoot>;
};
