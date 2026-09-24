import { useContext } from "react";
import { Client } from "@talxis/client-libraries";
import { NestedControlRenderer } from "@controls/nested-control-renderer";
import { INestedControlRendererComponentProps } from "@controls/nested-control-renderer/interfaces";
import { IGridValueRenderer } from "@controls/grid/value-renderer";
import { IControl } from "@interfaces";
import { IGridControl } from "../../../services/cells";
import { useGridCell } from "../root";
import { useGridService } from "../../../useGridService";
import { GridServicesContext } from "../../../context";
import { CellNestedRoot } from "../nested-react-root/CellNestedRoot";
import { getBindings } from "./getBindings";

const client = new Client();

export interface ICellLegacyNestedControlProps {
    /** What the cell renderer would have been given. */
    controlProps: IGridValueRenderer;
    /** The cell this is drawing, which knows whether it takes input. */
    control: IGridControl;
}

/** A control the nested-control registry resolves, as a cell needs it. */
export const CellLegacyNestedControl = (props: ICellLegacyNestedControlProps) => {
    const { controlProps, control } = props;
    const { context, parameters } = controlProps;
    const cell = useGridCell();
    const settings = useGridService('settings');
    const fieldControl = control.getFieldControl();
    const column = fieldControl?.getColumn();
    const customControl = control.getCustomControl();

    //a root of its own, so the control's own handlers run before AG Grid's
    return <CellNestedRoot>
        <NestedControlRenderer
            context={context}
            parameters={{
                ControlName: customControl.name,
                LoadingType: 'shimmer',
                Bindings: getBindings({
                    field: fieldControl?.getField(),
                    column: column,
                    control: customControl,
                    enableNavigation: !!parameters.EnableNavigation?.raw,
                }),
                ControlStates: {
                    isControlDisabled: !cell.isEditable()
                }
            }}
            onOverrideComponentProps={(componentProps: INestedControlRendererComponentProps) => ({
                ...componentProps,
                onOverrideUnmount: (control, defaultUnmount) => {
                    //unmounting a nested PCF in Power Apps re-initializes the others.
                    if (control.isMountedPcfComponent() && !client.isTalxisPortal()) {
                        control.getControlInstance()?.destroy();
                        return;
                    }
                    return defaultUnmount();
                },
                onOverrideControlProps: (controlProps: IControl<any, any, any, any>) => {
                    //the control builds its own parameters out of the bindings
                    const controlParameters = control.getFinalControlParameters({ ...parameters, ...controlProps.parameters });
                    return {
                        ...controlProps,
                        parameters: controlParameters,
                        context: {
                            ...controlProps.context,
                            mode: Object.create(controlProps.context.mode, {
                                allocatedHeight: {
                                    //the row as the grid has it
                                    value: (cell.getNode()?.rowHeight ?? settings.getDefaultRowHeight()) - 4
                                },
                            }),
                            parameters: controlParameters,
                        },
                    };
                }
            })} />
    </CellNestedRoot>;
};
