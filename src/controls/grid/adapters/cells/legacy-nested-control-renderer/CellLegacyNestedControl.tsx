import { Client } from "@talxis/client-libraries";
import { NestedControlRenderer } from "@fields/nested-control-renderer";
import { INestedControlRendererComponentProps } from "@fields/nested-control-renderer/interfaces";
import { IGridValueRenderer } from "../../value-renderer";
import { IControl } from "@pcf/interfaces";
import { ITheme, useAppTheme } from "@theme";
import { IGridControl } from "../../../runtime/cells";
import { useGridCell } from "../root";
import { useGridServiceInternal } from "../../../useGridService";
import { CellNestedRoot } from "../nested-react-root/CellNestedRoot";
import { getBindings } from "./getBindings";

const client = new Client();

//a PCF the page loaded builds its theme from these tokens, not from the cell's React theme
const getCellDesignLanguage = (theme: ITheme, applicationTheme: ITheme, designLanguage?: ComponentFramework.FluentDesignState): ComponentFramework.FluentDesignState => ({
    ...designLanguage,
    //what the PCF draws its callouts and other surfaces in
    applicationTheme,
    isDarkTheme: theme.isInverted,
    tokenTheme: {
        ...designLanguage?.tokenTheme,
        colorBrandBackground: theme.palette.themePrimary,
        colorCompoundBrandForeground1: theme.palette.themePrimary,
        colorNeutralBackground1: theme.semanticColors.bodyBackground,
        colorNeutralForeground1: theme.semanticColors.bodyText,
    },
    v8FluentOverrides: { palette: theme.palette, semanticColors: theme.semanticColors, fonts: theme.fonts, effects: theme.effects },
} as ComponentFramework.FluentDesignState);

export interface ICellLegacyNestedControlProps {
    /** What the cell renderer would have been given. */
    controlProps: IGridValueRenderer;
    /** The cell this is drawing. */
    control: IGridControl;
}

/** A control the nested-control registry resolves, as a cell needs it. */
export const CellLegacyNestedControl = (props: ICellLegacyNestedControlProps) => {
    const { controlProps, control } = props;
    const { context, parameters } = controlProps;
    const cell = useGridCell();
    const settings = useGridServiceInternal('settings');
    const applicationTheme = useAppTheme();
    const fieldControl = control.getFieldControl();
    const column = fieldControl?.getColumn();
    const controlName = control.getControl().name;

    //a root of its own runs the control's handlers before AG Grid's
    return <CellNestedRoot>
        <NestedControlRenderer
            context={context}
            parameters={{
                ControlName: controlName,
                LoadingType: 'shimmer',
                Bindings: getBindings({
                    field: fieldControl?.getField(),
                    column: column,
                    parameters: parameters,
                }),
                ControlStates: {
                    isControlDisabled: cell.isLocked()
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
                onOverrideControlProps: (controlProps: IControl<any, any, any>) => {
                    //the cell's parameters win over the manifest's defaults
                    const controlParameters = { ...controlProps.parameters, ...parameters, value: controlProps.parameters.value };
                    return {
                        ...controlProps,
                        parameters: controlParameters,
                        context: {
                            ...controlProps.context,
                            fluentDesignLanguage: getCellDesignLanguage(cell.getTheme().get(), applicationTheme, controlProps.context.fluentDesignLanguage),
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
