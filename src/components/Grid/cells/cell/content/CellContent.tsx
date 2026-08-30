import { useTheme, ITextFieldStyles, IComboBoxStyles, IDatePickerStyles, IToggleStyles, mergeThemes, merge } from "@fluentui/react";
import { Client, DataProvider, DeepPartial, ICommand, IColumn, ICustomColumnFormatting, IRecord } from "@talxis/client-libraries";
import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { IFluentDesignState, ControlTheme } from "@utils";
import { ITheme } from "@legacy";
import { NestedControlRenderer } from "@components/NestedControlRenderer";
import { getJustifyContent } from "@components/Grid/grid/styles";
import { useGridInstance } from "@components/Grid/grid/useGridInstance";
import { ICellProps } from "../Cell";
import { getCellContentStyles } from "./styles";
import { useAgGridInstance } from "@components/Grid/grid/ag-grid/useAgGridInstance";

const client = new Client();


//the component overrides depend only on the column alignment, so there are three of them in the whole
//application - they used to be rebuilt, and deep-merged, per cell per render
const componentOverridesByAlignment = new Map<IColumn['alignment'] | undefined, DeepPartial<ITheme>['components']>();

const getComponentOverrides = (columnAlignment: IColumn['alignment'] | undefined) => {
    const cached = componentOverridesByAlignment.get(columnAlignment);
    if (cached) {
        return cached;
    }
    const overrides = {
        'TextField': {
            styles: {
                field: {
                    textAlign: columnAlignment
                }
            } as ITextFieldStyles
        },
        'ComboBox': {
            styles: {
                input: {
                    textAlign: columnAlignment === 'right' ? 'right' : undefined,
                    paddingRight: columnAlignment === 'right' ? 8 : undefined,
                }
            } as IComboBoxStyles
        },
        'DatePicker': {
            styles: {
                root: {
                    '.ms-TextField-field': {
                        paddingRight: columnAlignment === 'right' ? 8 : undefined,
                        textAlign: columnAlignment === 'right' ? 'right' : 'left'
                    }
                } as any
            } as IDatePickerStyles
        },
        'Toggle': {
            styles: {
                root: {
                    justifyContent: getJustifyContent(columnAlignment)
                }
            } as IToggleStyles
        }
    };
    componentOverridesByAlignment.set(columnAlignment, overrides as any);
    return overrides as any;
};

/**
 * A stable name for a theme override, from its content.
 *
 * Content and not identity: `getFieldFormatting` rebuilds its override on every call, and the formatting
 * callback behind it is the consumer's own - so no override object survives from one render to the next,
 * and a name taken from identity would be a new name every time.
 *
 * `undefined` means the override cannot be named, and so cannot be cached under one. That covers a style
 * *function*, which is part of what an override does to a theme and which no serialisation can tell from
 * another - naming two of those alike would hand the second one the first one's theme.
 */
const getOverrideName = (override?: object): string | undefined => {
    if (!override || Object.keys(override).length === 0) {
        return '';
    }
    //an override that names itself is taken at its word, the same as everywhere else
    const declaredName = (override as ITheme).id;
    if (declaredName) {
        return declaredName;
    }
    let isNameable = true;
    try {
        const name = JSON.stringify(override, (_key, value) => {
            if (typeof value === 'function') {
                isNameable = false;
            }
            return value;
        });
        return isNameable ? name : undefined;
    }
    catch {
        //a cycle, so there is nothing to name it by
        return undefined;
    }
};

export const CellContent = (props: ICellProps) => {
    const columnRef = React.useRef(props.baseColumn);
    const mountedRef = React.useRef(false);
    const valueRef = React.useRef(props.value);
    columnRef.current = props.baseColumn;
    valueRef.current = props.value
    const grid = useGridInstance();
    const agGrid = useAgGridInstance();
    const record = props.data;
    const node = props.node;
    const themeRef = React.useRef(useTheme());
    themeRef.current = useTheme();
    const styles = React.useMemo(() => getCellContentStyles(valueRef.current.columnAlignment, node.rowHeight!), [valueRef.current.columnAlignment, node.rowHeight]);
    //defer loading of the nested control to solve edge case where the changed values from onNotifyOutputChanged triggered by unmount would not be available straight away
    const [shouldRenderNestedControl, setShouldRenderNestedControl] = React.useState(false);

    const getColumn = () => {
        return columnRef.current;
    }

    /**
     * Names the override this cell builds below. Everything the override varies by has to appear here:
     * the theme caches key on this id, so anything left out would serve another cell's theme.
     *
     * `undefined` when either override cannot be named. The theme is then built for this cell alone
     * rather than cached under a name that does not hold, which is what keeps a cache from filling up
     * with an entry per render.
     */
    const getThemeId = (formatting: ICustomColumnFormatting, parentOverrides?: object) => {
        const formattingName = getOverrideName(formatting.themeOverride);
        const parentName = getOverrideName(parentOverrides);
        if (formattingName === undefined || parentName === undefined) {
            return undefined;
        }
        const aggregated = valueRef.current.aggregatedValue != null ? `agg:${valueRef.current.aggregatedValue}` : 'val';
        return [
            'cell',
            valueRef.current.columnAlignment ?? '',
            aggregated,
            formatting.backgroundColor,
            formattingName,
            parentName,
        ].join('|');
    }

    const getFonts = () => {
        if (valueRef.current.aggregatedValue != null) {
            return {
                medium: {
                    fontSize: 15,
                    fontWeight: 600
                }
            }
        }
        else {
            return {};
        }
    }

    const getFluentDesignLanguage = (fluentDesignLanguage?: IFluentDesignState) => {
        const formatting = grid.getFieldFormatting(record, getColumn().name);
        const parentOverrides = fluentDesignLanguage?.v8FluentOverrides;
        const hasOverrides = !!formatting.themeOverride && Object.keys(formatting.themeOverride).length > 0;
        const columnAlignment = valueRef.current.columnAlignment;
        const ownOverrides = {
                    id: getThemeId(formatting, parentOverrides),
                    semanticColors: {
                        inputBorder: 'transparent',
                        inputBorderHovered: 'transparent',
                        inputBackground: formatting.backgroundColor,
                        focusBorder: 'transparent',
                        disabledBorder: 'transparent',
                        inputFocusBorderAlt: 'transparent',
                        errorText: 'transparent'

                    },
                    fonts: getFonts(),
                    effects: {
                        underlined: false
                    },
                    components: getComponentOverrides(columnAlignment)
        };
        //merged only when there is something to merge: the common cell has no conditional formatting and
        //no parent override, and this used to run two deep merges regardless
        const v8FluentOverrides: any = hasOverrides || parentOverrides
            ? merge({}, ownOverrides, merge({}, parentOverrides ?? {}, formatting.themeOverride))
            : ownOverrides;
        //an override that names itself would otherwise write its own id over the one computed above, and
        //both theme caches key on that id - so a grid rendered inside another grid's cell, which inherits
        //that cell's named override, would serve every one of its own cells the same theme. `getThemeId`
        //already folds both overrides' names in, so it is the id that describes this cell. `undefined`
        //has to win too: it is how a cell says it cannot be cached at all
        v8FluentOverrides.id = ownOverrides.id;
        return ControlTheme.GenerateFluentDesignLanguage(formatting.primaryColor, formatting.backgroundColor, formatting.textColor, {
            v8FluentOverrides,
            applicationTheme: fluentDesignLanguage?.applicationTheme
        });
    }

    const isControlDisabled = () => {
        return !valueRef.current.editable;
    }

    const onNotifyOutputChanged = (outputs: any) => {
        agGrid.onNotifyOutputChanged(record, columnRef.current.name, outputs.value, valueRef.current.parameters)
    }
    const debouncedNotifyOutputChanged = useDebouncedCallback((outputs) => onNotifyOutputChanged(outputs), 100);

    React.useEffect(() => {
        mountedRef.current = true;
        setShouldRenderNestedControl(true);
        return () => {
            mountedRef.current = false;
        }
    }, []);

    if (!shouldRenderNestedControl) {
        return <></>
    }
    return <NestedControlRenderer
        context={grid.getPcfContext()}
        parameters={{
            ControlName: valueRef.current.customControl.name,
            LoadingType: 'shimmer',
            Bindings: grid.getBindings(record, getColumn(), valueRef.current.customControl),
            ControlStates: {
                isControlDisabled: isControlDisabled()
            },
        }}
        onNotifyOutputChanged={(outputs) => {
            //talxis portal does not have debounce for notifyoutput
            //Power Apps does a debounce of 100ms
            if (getColumn().oneClickEdit && client.isTalxisPortal()) {
                debouncedNotifyOutputChanged(outputs);
            }
            else {
                onNotifyOutputChanged(outputs);
            }
        }}
        onOverrideComponentProps={(componentProps) => {
            return {
                ...componentProps,
                rootContainerProps: {
                    ...componentProps.rootContainerProps,
                    className: styles.controlRoot
                },
                controlContainerProps: {
                    className: styles.controlContainer
                },
                overridenControlContainerProps: {
                    className: styles.overridenControlContainer
                },
                messageBarProps: {
                    ...componentProps.messageBarProps,
                    styles: {
                        root: styles.errorMessageRoot,
                        content: styles.errorMessageContent
                    }
                },
                loadingProps: {
                    ...componentProps.loadingProps,
                    shimmerProps: {
                        ...componentProps.loadingProps.shimmerProps,
                        styles: {
                            ...componentProps.loadingProps?.shimmerProps?.styles,
                            shimmerWrapper: styles.shimmerWrapper
                        }
                    },
                    containerProps: {
                        ...componentProps.loadingProps?.containerProps,
                        className: styles.loadingWrapper
                    }
                },
                onOverrideRender: (control, isCustomPcfComponent, defaultRender) => {
                    if (isCustomPcfComponent) {
                        //grid.setUsesNestedPcfs();
                    }
                    if (valueRef.current.customComponent) {
                        const result = valueRef.current.customComponent.onRender(control.getProps(), themeRef.current, control.getContainer())
                        //onRender can explicitly return null to force the grid to use native renderer
                        //useful if the custom component is required only for renderer, but not for editor or vice versa
                        if (result === null) {
                            return defaultRender();
                        }
                        return result;
                    }
                    return defaultRender();
                },
                onOverrideUnmount: (control, defaultUnmount) => {
                    if (valueRef.current.customComponent) {
                        const result = valueRef.current.customComponent.onUnmount(control.getContainer());
                        //onRender can explicitly return null to force the grid to use native renderer
                        //useful if the custom component is required only for renderer, but not for editor or vice versa
                        if (result === null) {
                            return defaultUnmount();
                        }
                        return result;
                    }
                    //@ts-ignore - internal types
                    //skip the unmounting for custom PCF's in Power Apps
                    // PCF unmount in Power Apps causes other nested PCF's to reinitialize which causes flickering
                    //umounting of nested PCF's happens on grid destroy to prevent memory leaks (currently done by refreshing the page as no better method was found)
                    if (control.isMountedPcfComponent() && !client.isTalxisPortal()) {
                        //we can atleast destroy the react component
                        control.getControlInstance()?.destroy();
                        return;
                    }
                    return defaultUnmount();
                },
                onOverrideControlProps: (controlProps) => {
                    //here we always need to fetch the latest parameters
                    //we still might have old one's cached in valueRef
                    const columnInfo = record.getColumnInfo(getColumn().name);
                    const parameters = columnInfo.ui.getControlParameters({
                        ...grid.getFieldBindingParameters(record, getColumn(), props.isCellEditor),
                        ...controlProps.parameters
                    })
                    return {
                        ...controlProps,
                        context: {
                            ...controlProps.context,
                            mode: Object.create(controlProps.context.mode, {
                                allocatedHeight: {
                                    //-4 is needed to offset the auto size behavior
                                    value: node.rowHeight! - 1
                                },

                            }),
                            parameters: parameters,
                            fluentDesignLanguage: getFluentDesignLanguage(controlProps.context.fluentDesignLanguage)
                        },
                        parameters: parameters
                    }
                }
            }
        }}
    />
}
