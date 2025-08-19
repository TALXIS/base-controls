import { Callout, IconButton, ICalloutProps } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { DatasetColumnFiltering } from '../../../DatasetControl/Filtering/DatasetColumnFiltering';
import { getClassNames } from '@talxis/react-components';
import { useEffect } from 'react';
import { IGridColumn } from '../../grid/GridModel';
import { useGridInstance } from '../../grid/useGridInstance';
import { filterCalloutStyles } from './styles';
import { ILookup } from '../../../Lookup';
import { INestedControlRenderer } from '../../../NestedControlRenderer/interfaces';

export interface IFilterCallout extends ICalloutProps {
    column: IGridColumn;
    onDismiss: () => void;
}

export const FilterCallout = (props: IFilterCallout) => {
    const { column, onDismiss } = { ...props };
    const grid = useGridInstance();
    const dataset = grid.getDataset();
    const context = grid.getPcfContext();
    const labels = grid.getLabels();

    const onColumnFilterSaved = (filter: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression) => {
        dataset.executeWithUnsavedChangesBlocker(() => {
            onDismiss();
            dataset.filtering.setFilter(filter);
            dataset.refresh();
        })
    }

    const onRenderConditionValueControl = (props: INestedControlRenderer, defaultRender: (props: INestedControlRenderer) => React.ReactElement) => {
        switch (column.dataType) {
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding':
            case 'Lookup.Simple': {
                return defaultRender({
                    ...props,
                    onOverrideComponentProps: (props) => {
                        return {
                            ...props,
                            onOverrideControlProps: (props: ILookup): ILookup => {
                                return {
                                    ...props,
                                    parameters: {
                                        ...props.parameters,
                                        value: {
                                            ...props.parameters.value,
                                            //@ts-ignore
                                            getAllViews: (() => {
                                                const originalGetAllViews = props.parameters.value.getAllViews;
                                                //@ts-ignore
                                                return (...args) => originalGetAllViews(...args, 1);
                                            })()
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }
            default: {
                return defaultRender(props);
            }
        }
    }

    useEffect(() => {
        return () => {
            if (!column.isFiltered) {
                grid.removeColumnFilter(column.name)
            }
        }
    }, []);

    return (
        <Callout
            {...props}
            calloutWidth={230}
            className={filterCalloutStyles.root}>
            <div className={filterCalloutStyles.header}>
                <Text className={filterCalloutStyles.title} variant="mediumPlus">{labels['filtermenu-filterby']()}</Text>
                <IconButton onClick={() => onDismiss()} iconProps={{
                    iconName: 'ChromeClose',
                }} />
            </div>
            <DatasetColumnFiltering
                parameters={{
                    ColumnName: {
                        raw: column.name,
                    },
                    Filtering: grid.getFiltering()
                }}
                onNotifyOutputChanged={(outputs) => onColumnFilterSaved(outputs)}
                onOverrideComponentProps={(props) => {
                    return {
                        ...props,
                        onRender: (props, defaultRender) => {
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
                                onRenderConditionValueControl: onRenderConditionValueControl,
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
        </Callout>
    );
};