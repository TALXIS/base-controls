import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { IAlignment } from "@utils";
import { ColumnHeaderComponents, IColumnHeaderComponents } from "./components";
import { ColumnHeaderContext } from "./context";
import { getColumnHeaderStyles } from "./styles";

export interface IColumnHeaderProps {
    /** The name drawn in the header. */
    name: string;
    /** What the tooltip says, where it says more than the name. */
    title?: string;
    alignment?: IAlignment;
    /** Whether the column asks for a value, which is what the asterisk says. */
    isRequired?: boolean;
    /** Whether what the column holds may be changed. */
    isEditable?: boolean;
    components?: Partial<IColumnHeaderComponents>;
}

/** A column's header: its name, and what is drawn beside it. */
export const ColumnHeader = (props: IColumnHeaderProps) => {
    const { name, title, alignment = 'left', isRequired } = props;
    const theme = useTheme();
    const components = { ...ColumnHeaderComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderStyles(theme, alignment), [theme, alignment]);

    const header = components.onRenderButton({
        title: title ?? name,
        styles: {
            root: styles.commandBarButtonRoot,
            flexContainer: styles.commandBarButtonFlexContainer
        },
        children: <>
            {components.onRenderNameContainer({
                className: styles.columnDisplayNameContainer,
                children: <>
                    {components.onRenderPrefix()}
                    {components.onRenderName({ styles: { root: styles.columnDisplayNameText }, children: name })}
                    {isRequired && components.onRenderRequiredMarker({ className: styles.asterix })}
                </>
            })}
            {components.onRenderSuffix()}
        </>
    });

    return <ColumnHeaderContext.Provider value={{ ...props, alignment: alignment, components: components, styles: styles }}>
        {header}
    </ColumnHeaderContext.Provider>;
};
