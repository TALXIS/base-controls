import { IColumn } from "@talxis/client-libraries";
import { GroupBase } from 'react-select';
import { TooltipHost, useTheme} from "@fluentui/react";
import AsyncSelect from 'react-select/async';
import { AsyncProps } from 'react-select/dist/declarations/src/useAsync';
import { useModel } from "../../useModel";
import { components } from 'react-select';

type ReactSelectProps<IsMulti extends boolean> = AsyncProps<IColumn, IsMulti, GroupBase<IColumn>>;

interface ISelectorProps<IsMulti extends boolean> {
    onOverrideComponentProps?: (props: ReactSelectProps<IsMulti>) => ReactSelectProps<IsMulti>
}

export const Selector = <IsMulti extends boolean>(props: ISelectorProps<IsMulti>) => {
    const theme = useTheme();
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((p) => p);
    const labels = useModel().getLabels();

    const componentProps = onOverrideComponentProps({
        getOptionValue: (column: any) => column.name,
        getOptionLabel: (column: any) => column.displayName ?? labels['no-name'](),
        isClearable: false,
        defaultOptions: true,
        styles: {
            option: (base) => {
                return {
                    ...base,
                    padding: 0
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
                    <div style={{padding: '8px 12px'}}>
                        {props.children}
                    </div>
                </TooltipHost>
            </components.Option>
        }
    })

    return <AsyncSelect {...componentProps} />
}