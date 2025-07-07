import { Callout, IconButton, ICalloutProps } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { filterCalloutStyles } from './styles';
import { IGridColumn } from '../../../core/interfaces/IGridColumn';
import { Grid2 } from '../../../core/model/Grid';
import { useGridInstance } from '../../../core/hooks/useGridInstance';
import { DatasetColumnFiltering } from '../../../../DatasetControl/Filtering/DatasetColumnFiltering';
import { getClassNames } from '@talxis/react-components';

export interface IFilterCallout extends ICalloutProps {
    column: IGridColumn;
    onDismiss: () => void;
}

export const FilterCallout = (props: IFilterCallout) => {
    const { column, onDismiss } = { ...props };
    const grid: Grid2 = useGridInstance() as any;
    const dataset = grid.getDataset();
    const context = grid.getPcfContext();
    const labels = grid.getLabels();

    const onColumnFilterSaved = (filter: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression) => {
        onDismiss();
        dataset.filtering.setFilter(filter);
        dataset.refresh();
    }

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