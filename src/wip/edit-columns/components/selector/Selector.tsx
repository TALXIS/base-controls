import { IColumn } from "@talxis/client-libraries";
import { useTheme } from "@fluentui/react";
import { AsyncProps } from 'react-select/async';
import React, { useCallback, useMemo } from "react";
import { useEditColumnsLabels } from "../../context";
import { Option } from "./components/option";
import { Menu } from "./components/menu";

interface ISelectorProps {
  components: {
    Select: React.ComponentType<AsyncProps<any, any, any>>;
  };
}


export const Selector = (props: ISelectorProps) => {
    const theme = useTheme();
    const labels = useEditColumnsLabels();
    const id = useMemo(() => `selector-${window.crypto.randomUUID()}`, []);
    
    const Select = props.components?.Select;

    const MenuWithId = useCallback((props: any) => {
        return <Menu menuProps={props} selectorId={id}  />
    }, [id]);

    return (
        <Select
            id={id}
            getOptionValue={(column: IColumn) => column.name}
            getOptionLabel={(column: IColumn) => column.displayName ?? labels.noName}
            noOptionsMessage={() => labels.noResults}
            maxMenuHeight={600}
            isClearable={false}
            defaultOptions={true}
            styles={{
                option: (base) => ({
                    ...base,
                    padding: 0,
                    cursor: 'pointer',
                }),
                menu: () => ({
                    width: 300
                }),
                menuList: (base) => ({
                    ...base,
                    scrollbarWidth: 'thin'
                })
            }}
            theme={(base: any) => ({
                ...base,
                colors: {
                    ...base.colors,
                    primary: theme.palette.themePrimary,
                    primary75: theme.palette.themeLighterAlt,
                    primary50: theme.palette.themeLight,
                    primary25: theme.palette.themeLighter,
                }
            })}
            components={{
                Option: Option,
                Menu: MenuWithId
            }}
        />
    );
}