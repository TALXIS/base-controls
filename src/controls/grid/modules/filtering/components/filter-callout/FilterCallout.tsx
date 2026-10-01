import { useEffect, useMemo } from "react";
import { Target } from "@fluentui/react";
import { IColumn, IInternalDataProvider } from "@talxis/client-libraries";
import { getClassNames, usePcfContext } from "@utils";
import { DatasetColumnFiltering } from "@controls/dataset-control/filtering/DatasetColumnFiltering";
import { IOptionSet } from "@controls/fields/option-set";
import { INestedControlRenderer } from "@controls/nested-control-renderer/interfaces";
import { IControl, IParameters } from "@interfaces";
import { GridFilterControl } from "../../GridFiltering";
import { useGridService } from "../../../../useGridService";
import { useGridFilteringLabels } from "../../useGridFilteringLabels";
import { FilteringUi, IFilteringUiCalloutComponents } from "../ui";
import { getFilterCalloutStyles } from "./styles";

export interface IFilterCalloutProps {
    column: IColumn;
    /** What the callout points at. */
    target?: Target;
    onDismiss: () => void;
    components?: Partial<IFilteringUiCalloutComponents>;
}

/** The callout a column's filter is set in, wired to the provider it filters. */
export const FilterCallout = (props: IFilterCalloutProps) => {
    const { column, onDismiss } = props;
    const filterCalloutStyles = useMemo(() => getFilterCalloutStyles(), []);
    const filtering = useGridService('filtering')!;
    const provider = useGridService('provider');
    const dataProvider = provider as IInternalDataProvider;
    const context = usePcfContext();
    const labels = useGridFilteringLabels();

    const onColumnFilterSaved = (filter: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression) => {
        dataProvider.executeWithUnsavedChangesBlocker(() => {
            onDismiss();
            provider.setFiltering(filter);
            provider.refresh();
        })
    }

    const getParameters = (parameters: IParameters, control: GridFilterControl, index: number): IParameters => {
        return filtering.getFilterControlParameters(parameters, { column: column, control: control, index: index });
    }

    const onRenderConditionOperatorControl = (props: IOptionSet, defaultRender: (props: IOptionSet) => React.ReactElement) => {
        return defaultRender({ ...props, parameters: getParameters(props.parameters, 'operator', 0) as IOptionSet['parameters'] });
    }

    const onRenderConditionValueControl = (props: INestedControlRenderer, defaultRender: (props: INestedControlRenderer) => React.ReactElement, index: number) => {
        const onOverrideComponentProps = props.onOverrideComponentProps;
        return defaultRender({
            ...props,
            onOverrideComponentProps: (componentProps) => {
                const base = onOverrideComponentProps?.(componentProps) ?? componentProps;
                return {
                    ...base,
                    onOverrideControlProps: (controlProps: IControl<any, any, any, any>) => {
                        const next = base.onOverrideControlProps?.(controlProps) ?? controlProps;
                        return { ...next, parameters: getParameters(next.parameters, 'value', index) };
                    }
                }
            }
        });
    }

    useEffect(() => {
        return () => {
            if (!filtering.isFiltered(column)) {
                filtering.removeColumnFilter(column.name)
            }
        }
    }, []);

    return (
        <FilteringUi.Callout
            target={props.target}
            title={labels.getLocalizedString('filterMenuFilterBy')}
            onDismiss={onDismiss}
            components={props.components}>
            <DatasetColumnFiltering
                parameters={{
                    ColumnName: {
                        raw: column.name,
                    },
                    Filtering: filtering.getFiltering()
                }}
                onNotifyOutputChanged={(outputs) => onColumnFilterSaved(outputs)}
                onOverrideComponentProps={(props) => {
                    return {
                        ...props,
                        onRender: (props, defaultRender) => {
                            //the value controls are drawn in order, one or two of them
                            let valueControlIndex = 0;
                            return defaultRender({
                                ...props,
                                container: {
                                    ...props.container,
                                    className: getClassNames([props.container.className, filterCalloutStyles.datasetColumnFilteringRoot]),
                                },
                                valueControlsContainer: {
                                    ...props.valueControlsContainer,
                                    className: getClassNames([props.valueControlsContainer.className, filterCalloutStyles.valueControlsContainer]),
                                },
                                onRenderConditionOperatorControl: onRenderConditionOperatorControl,
                                onRenderConditionValueControl: (props, defaultRender) => onRenderConditionValueControl(props, defaultRender, valueControlIndex++),
                                onRenderButtons: (props, defaultRender) => {
                                    return defaultRender({
                                        ...props,
                                        container: {
                                            className: getClassNames([props.container.className, filterCalloutStyles.datasetColumnFilteringButtons])
                                        }
                                    })
                                }
                            })
                        }
                    }
                }}
                context={context} />
        </FilteringUi.Callout>
    );
};
