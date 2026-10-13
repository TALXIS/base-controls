import React, { forwardRef, useMemo } from "react";
import { DirectionalHint, Label, useTheme } from "@fluentui/react";
import { components as selectComponents, GroupBase, SelectInstance } from "react-select";
import AsyncSelect from "react-select/async";
import { AsyncProps } from "react-select/dist/declarations/src/useAsync";
import { Callout, TooltipHost } from "@ui";
import { EditColumnsSelectorUiComponents, IEditColumnsSelectorUiComponents } from "./components";
import { getEditColumnsSelectorUiStyles } from "./styles";

/** Props for the select the column editor's pickers are built on. */
export interface IEditColumnsSelectorUiProps<TOption, IsMulti extends boolean = false> extends Omit<AsyncProps<TOption, IsMulti, GroupBase<TOption>>, 'components'> {
    /** Drawn above the selector. */
    label?: string;
    /** Shown when no option matches. */
    noResultsText: string;
    /** Shown in the menu while the options load. */
    loadingText: string;
    /** What an option's tooltip says; its label when left out. */
    getOptionTooltip?: (option: TOption) => string;
    /** Replacements for its slots. */
    components?: Partial<IEditColumnsSelectorUiComponents<TOption>>;
}

const EditColumnsSelectorWithRef = <TOption, IsMulti extends boolean = false>(props: IEditColumnsSelectorUiProps<TOption, IsMulti>, ref: React.Ref<SelectInstance<TOption, IsMulti>>) => {
    const { label, noResultsText, loadingText, getOptionTooltip, components: componentsProp, ...selectProps } = props;
    const components = { ...EditColumnsSelectorUiComponents, ...componentsProp } as IEditColumnsSelectorUiComponents<TOption>;
    const theme = useTheme();
    const styles = useMemo(() => getEditColumnsSelectorUiStyles(), []);
    const id = useMemo(() => `selector-${crypto.randomUUID()}`, []);

    //memoized so react-select keeps the menu mounted while its options load
    const Menu = useMemo(() => React.memo((menuProps: any) => <Callout directionalHint={DirectionalHint.leftTopEdge} target={`#${id}`}>
        <selectComponents.Menu {...menuProps} />
    </Callout>), [id]);

    const select = <AsyncSelect<TOption, IsMulti, GroupBase<TOption>>
        id={id}
        ref={ref}
        isClearable={false}
        defaultOptions
        maxMenuHeight={600}
        noOptionsMessage={() => noResultsText}
        loadingMessage={() => loadingText}
        styles={{
            option: base => ({ ...base, padding: 0, cursor: 'pointer' }),
            menu: () => ({ width: 300 }),
            menuList: base => ({ ...base, scrollbarWidth: 'thin' }),
        }}
        theme={base => ({
            ...base,
            colors: {
                ...base.colors,
                primary: theme.palette.themePrimary,
                primary75: theme.palette.themeLighterAlt,
                primary50: theme.palette.themeLight,
                primary25: theme.palette.themeLighter,
            },
        })}
        components={{
            Menu,
            Option: optionProps => <selectComponents.Option {...optionProps}>
                <TooltipHost content={getOptionTooltip?.(optionProps.data) ?? optionProps.label}>
                    <div className={styles.option}>
                        {components.onRenderOption({ option: optionProps.data, text: optionProps.label })}
                    </div>
                </TooltipHost>
            </selectComponents.Option>,
        }}
        {...selectProps} />;

    return <div>
        {label && <Label>{label}</Label>}
        {components.onRenderSelector({ children: select })}
    </div>;
};

/** An async, searchable selector whose menu opens beside it. */
export const EditColumnsSelector = forwardRef(EditColumnsSelectorWithRef) as <TOption, IsMulti extends boolean = false>(
    props: IEditColumnsSelectorUiProps<TOption, IsMulti> & { ref?: React.Ref<SelectInstance<TOption, IsMulti>> }
) => JSX.Element | null;
