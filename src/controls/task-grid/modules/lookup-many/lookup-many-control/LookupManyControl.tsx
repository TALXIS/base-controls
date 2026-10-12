import { useMemo } from "react";
import AsyncSelect from "react-select/async";
import { useTheme } from "@fluentui/react";
import { ThemeProvider } from "@utils";
import { IGridValueRenderer, useGridCell, useGridField, useGridService } from "@controls/grid";
import { useTaskGridRuntime, useTaskDataProvider } from "@controls/task-grid/context";
import { ColorfulLookupMany, ILookupManyProps, LookupMany, PeopleLookupMany } from "../components";
import { getLookupManyControlStyles } from "./styles";

enum ControlName {
    LookupMany = 'LookupMany',
    PeopleLookupMany = 'PeopleLookupMany',
    ColorfulLookupMany = 'ColorfulLookupMany',
}

/** The records a lookup-many cell holds, picked from while the cell is being edited. */
export const LookupManyControl = (props: IGridValueRenderer) => {
    const theme = useTheme();
    const styles = useMemo(() => getLookupManyControlStyles(), []);
    const cell = useGridCell();
    const field = useGridField();
    const services = useTaskGridRuntime().services;
    const taskDataProvider = useTaskDataProvider();
    const isNavigationEnabled = useGridService('settings').isNavigationEnabled();
    const record = cell.getRecord();
    const column = record.getDataProvider().getColumnsMap()[cell.getColumnName()];
    const takesInput = cell.takesInput();
    //one per cell: the picker drives its search through the provider
    const dataProvider = useMemo(() => {
        const dataProvider = services.get('lookupManyModule').createDataProvider({ record, column, services });
        if (!dataProvider) {
            throw new Error(`Column "${column.name}" is marked as lookup-many, but the lookup-many module returned no data provider for it.`);
        }
        return dataProvider;
    }, [column.name, record.getRecordId()]);
    const customControl = record.getColumnInfo(column.name).ui.getCustomControls([])?.[0];
    const bindings = customControl?.bindings;

    const componentProps: ILookupManyProps = {
        dataProvider: dataProvider,
        selectedRecords: props.parameters.value ?? undefined,
        isDisabled: !takesInput,
        onRecordSelect: selectedRecords => field?.setValue(selectedRecords),
        onRecordOpen: isNavigationEnabled ? entityReference => taskDataProvider.openDatasetItem(entityReference, { columnName: column.name }) : undefined,
        components: {
            onRenderSelect: selectProps => <AsyncSelect {...selectProps}
                autoFocus={takesInput}
                openMenuOnFocus
                openMenuOnClick
                styles={{
                    ...selectProps.styles,
                    control: (base, state) => ({
                        ...(selectProps.styles?.control?.(base, state) ?? base),
                        maxHeight: 200,
                        overflow: 'auto',
                        border: 'none',
                        background: 'none',
                        boxShadow: 'none',
                    }),
                    valueContainer: (base, state) => ({
                        ...(selectProps.styles?.valueContainer?.(base, state) ?? base),
                        flexWrap: 'wrap',
                    }),
                }} />,
        },
    };

    const getPicker = (): JSX.Element => {
        switch (customControl?.name) {
            case ControlName.ColorfulLookupMany:
                return <ColorfulLookupMany colorPropertyName={bindings?.ColorPropertyName?.value} {...componentProps} />;
            case ControlName.PeopleLookupMany:
                return <PeopleLookupMany imageUrlPropertyName={bindings?.ImageUrlPropertyName?.value} {...componentProps} />;
            default:
                return <LookupMany {...componentProps} />;
        }
    };

    return <div className={styles.root}>
        <ThemeProvider theme={theme}>{getPicker()}</ThemeProvider>
    </div>;
};
