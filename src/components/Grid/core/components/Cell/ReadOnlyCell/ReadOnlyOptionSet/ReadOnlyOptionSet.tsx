import React, { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Text } from '@fluentui/react/lib/Text';
import { optionSetStyles } from "./styles";
import color from 'color';
import { useTheme } from "@fluentui/react";
import { IGridColumn } from "../../../../interfaces/IGridColumn";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { DataType } from "../../../../enums/DataType";

interface IReadOnlyOptionSet {
    column: IGridColumn;
    record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
    defaultRender: () => ReactElement
}

export const ReadOnlyOptionSet = (props: IReadOnlyOptionSet) => {
    const grid = useGridInstance();
    const { record, column, defaultRender } = { ...props }
    const [options, setOptions] = useState<ComponentFramework.PropertyHelper.OptionMetadata[] | null>(null);
    const theme = useTheme();
    const defaultColor = theme.palette.neutralLight;

    useEffect(() => {
        (async () => {
            const getOptions = async (): Promise<ComponentFramework.PropertyHelper.OptionMetadata[]> => {
                const [defaultValue, options] = await grid.metadata.getOptions(column);
                let value: any = record.getValue(column.key);
                if (column.dataType === DataType.OPTIONSET) {
                    value = value ? [parseInt(value)] : null;
                }
                if (column.dataType === DataType.MULTI_SELECT_OPTIONSET) {
                    value = value ? value.split(',').map((value: string) => parseInt(value)) : null;
                }
                if (column.dataType === DataType.TWO_OPTIONS) {
                    value = [parseInt(value)];
                }
                return options.filter(option => value?.includes(option.Value)) ?? [];
            }
            const results = await getOptions();
            setOptions(results);
        })();
    }, [record.getValue(column.key)]);

    //options not loaded yet
    if (options === null) {
        return <></>
    }
    //options loaded but either no value selected or no colors are present
    if (options.length === 0 || !options.find(x => x.Color)) {
        return defaultRender();
    }
    else {
        return (
            <div className={optionSetStyles.root}>
                {options.map(x => <div
                    key={x.Value}
                    title={x.Label}
                    className={optionSetStyles.option}
                    style={{ backgroundColor: x.Color ?? defaultColor, color: new color(x.Color ?? defaultColor).isDark() ? 'white' : 'black' }}>
                    <Text>{x.Label}</Text>
                </div>)}
            </div>
        )
    }

}