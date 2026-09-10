import { Client } from "@talxis/client-libraries";
import { NestedControlRenderer } from "@components/NestedControlRenderer";
import { INestedControlRendererComponentProps } from "@components/NestedControlRenderer/interfaces";
import { IGridCellRenderer } from "@components/GridCellRenderer";
import { IControl } from "@interfaces";
import { GridControl } from "../../../services/cells";
import { useGridCell } from "../../cell-host";
import { ICellProps } from "../../interfaces";
import { getBindings } from "./getBindings";
import { NestedReactRoot } from "./nested-react-root";
import { getCellFluentDesignLanguage } from "./getCellFluentDesignLanguage";

const client = new Client();

export interface ILegacyNestedControlRendererProps {
    /** What the cell renderer would have been given, which is what the control is given too. */
    controlProps: IGridCellRenderer;
    /** The cell this control is drawn in, as AG Grid described it. */
    cellProps: ICellProps;
    /** The cell this is drawing, which knows whether it takes input. */
    control: GridControl;
}

/**
 * A control the nested-control registry resolves, as a cell needs it.
 *
 * Takes what the cell renderer takes and adds what a control drawn inside a cell needs on top of it: the
 * cell's theme, the row's height, and whether the field refuses input.
 */
export const LegacyNestedControlRenderer = (props: ILegacyNestedControlRendererProps) => {
    const { controlProps, cellProps, control } = props;
    const { context, parameters } = controlProps;
    const { record, baseColumn: column, node } = cellProps;
    const cellTheme = useGridCell().getTheme();
    const customControl = control.getCustomControl();
    const field = control.getField();

    //a root of its own, so the control's own handlers run before AG Grid's: React attaches its listeners
    //to the root's container, and the grid listens on the row container above it
    return <NestedReactRoot>
        <NestedControlRenderer
            context={context}
            parameters={{
                ControlName: customControl.name,
                LoadingType: 'shimmer',
                Bindings: getBindings({
                    record: record,
                    column: column,
                    control: customControl,
                    value: field.value,
                    formattedValue: field.formattedValue,
                    enableNavigation: !!parameters.EnableNavigation?.raw,
                    onNotifyOutputChanged: value => control.setValue(value)
                }),
                ControlStates: {
                    isControlDisabled: !control.isEditable()
                }
            }}
            onOverrideComponentProps={(componentProps: INestedControlRendererComponentProps) => ({
                ...componentProps,
                onOverrideUnmount: (control, defaultUnmount) => {
                    //unmounting a nested PCF in Power Apps re-initializes the others, which flickers - they
                    //are unmounted when the grid is destroyed instead. The react component can still go
                    if (control.isMountedPcfComponent() && !client.isTalxisPortal()) {
                        control.getControlInstance()?.destroy();
                        return;
                    }
                    return defaultUnmount();
                },
                onOverrideControlProps: (controlProps: IControl<any, any, any, any>) => {
                    //the control builds its own parameters out of the bindings, so what the cell knows goes
                    //under them - and the whole bag is what the record's expression and the hooks then see
                    const controlParameters = control.getFinalControlParameters({ ...parameters, ...controlProps.parameters });
                    return {
                        ...controlProps,
                        parameters: controlParameters,
                        context: {
                            ...controlProps.context,
                            mode: Object.create(controlProps.context.mode, {
                                allocatedHeight: {
                                    //the row as AG Grid has it, which is what a resized one measured to
                                    value: node.rowHeight! - 4
                                },
                            }),
                            parameters: controlParameters,
                            fluentDesignLanguage: getCellFluentDesignLanguage({
                                theme: cellTheme.getValue(),
                                columnAlignment: column.alignment,
                                parent: controlProps.context.fluentDesignLanguage
                            }),
                        },
                    };
                }
            })} />
    </NestedReactRoot>;
};
