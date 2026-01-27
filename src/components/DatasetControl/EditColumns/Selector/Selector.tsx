import { IColumn } from "@talxis/client-libraries";
import { GroupBase} from 'react-select';
import { useTheme } from "@fluentui/react";
import AsyncSelect from 'react-select/async';
import { AsyncProps } from 'react-select/dist/declarations/src/useAsync';

type ReactSelectProps<IsMulti extends boolean> = AsyncProps<IColumn, IsMulti, GroupBase<IColumn>>;

interface ISelectorProps<IsMulti extends boolean> {
    onOverrideComponentProps?: (props: ReactSelectProps<IsMulti>) => ReactSelectProps<IsMulti>
}

export const Selector = <IsMulti extends boolean>(props: ISelectorProps<IsMulti>) => {
    const theme = useTheme();
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((p) => p);

    const componentProps = onOverrideComponentProps({
        getOptionValue: (column: any) => column.name,
        getOptionLabel: (column: any) => column.displayName,
        isClearable: false,
        defaultOptions: true,
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
        }
    })

    return <AsyncSelect {...componentProps} />
}
<Selector />