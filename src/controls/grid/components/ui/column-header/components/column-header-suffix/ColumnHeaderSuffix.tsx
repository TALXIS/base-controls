import { useColumnHeader } from "../../context";
import { ColumnHeaderSuffixComponents } from "./components";

export interface IColumnHeaderSuffixProps {
    /** Drawn before the uneditable icon. */
    children?: React.ReactNode;
}

/** What a column header draws after the name. */
export const ColumnHeaderSuffix = (props: IColumnHeaderSuffixProps) => {
    const { isEditable, components: headerComponents, styles } = useColumnHeader();
    const components = { ...ColumnHeaderSuffixComponents, ...headerComponents.suffix };

    return components.onRenderContainer({
        className: styles.suffixIconsContainer,
        children: <>
            {props.children}
            {isEditable === false && components.onRenderUneditableIcon({ iconName: 'Uneditable' })}
        </>
    });
};
