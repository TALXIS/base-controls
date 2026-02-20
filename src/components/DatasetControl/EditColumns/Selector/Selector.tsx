import { IColumn } from "@talxis/client-libraries";
import { GroupBase } from 'react-select';
import { Callout, DirectionalHint, IconButton, TooltipHost, useTheme, Text } from "@fluentui/react";
import AsyncSelect from 'react-select/async';
import { AsyncProps } from 'react-select/dist/declarations/src/useAsync';
import { useModel } from "../../useModel";
import { components } from 'react-select';
import { useMemo } from "react";
import React from "react";
import { getSelectorStyles } from "./styles";
import { useEditColumns } from "../useEditColumns";

type ReactSelectProps<IsMulti extends boolean = false, TColumn extends IColumn = IColumn> = AsyncProps<TColumn, IsMulti, GroupBase<TColumn>>;

interface ISelectorProps<IsMulti extends boolean = false, TColumn extends IColumn = IColumn> {
    context: 'scopeSelector' | 'columnSelector';
    onOverrideComponentProps?: (props: ReactSelectProps<IsMulti, TColumn>) => ReactSelectProps<IsMulti, TColumn>
}

export const Selector = <IsMulti extends boolean = false, TColumn extends IColumn = IColumn>(props: ISelectorProps<IsMulti, TColumn>) => {
    const theme = useTheme();
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((p) => p);
    const labels = useModel().getLabels();
    const id = useMemo(() => `selector-${window.crypto.randomUUID()}`, []);
    const styles = useMemo(() => getSelectorStyles(), []);
    const { components: editColumnsComponents } = useEditColumns();
    const { context } = props;

    const MemoizedMenu = useMemo(() =>
        React.memo((props: any) => (
            <Callout
                directionalHint={DirectionalHint.leftTopEdge}
                target={`#${id}`}>
                <components.Menu {...props} />
            </Callout>
        )),
        [id]
    );

    const componentProps = onOverrideComponentProps({
        id: id,
        getOptionValue: (column) => column.name,
        getOptionLabel: (column) => column.displayName ?? labels['no-name'](),
        noOptionsMessage: () => labels['no-result-found'](),
        maxMenuHeight: 600,
        isClearable: false,
        defaultOptions: true,
        styles: {
            option: (base) => {
                return {
                    ...base,
                    padding: 0,
                    cursor: 'pointer',
                }
            },
            menu: () => {
                return {
                    width: 300
                }
            },
            menuList: (base) => {
                return {
                    ...base,
                    scrollbarWidth: 'thin'
                }
            }
        },
        theme: (base: any) => {
            return {
                ...base,
                colors: {
                    ...base.colors,
                    primary: theme.palette.themePrimary,
                    primary75: theme.palette.themeLighterAlt,
                    primary50: theme.palette.themeLight,
                    primary25: theme.palette.themeLighter,
                }
            }
        },
        components: {
            Option: (props) => <components.Option {...props}>
                <TooltipHost
                    content={props.data.name}
                >
                    <div className={styles.optionContainer}>
                        <Text className={styles.optionText}>{props.children}</Text>
                        {editColumnsComponents.OptionSuffix && 
                            <editColumnsComponents.OptionSuffix context={context} />
                        }
                    </div>
                </TooltipHost>
            </components.Option>,
            Menu: MemoizedMenu

        }
    })

    return <AsyncSelect {...componentProps} />
}