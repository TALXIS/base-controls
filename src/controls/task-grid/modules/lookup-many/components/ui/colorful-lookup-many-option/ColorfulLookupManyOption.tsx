import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { components, OptionProps } from "react-select";
import { getRawValue } from "../getRawValue";
import { getColorfulLookupManyOptionStyles } from "./styles";

/** Props for {@link ColorfulLookupManyOption}. */
export interface IColorfulLookupManyOptionProps extends OptionProps<ComponentFramework.EntityReference, true, never> {
    /** The record field holding its colour; `color` when left out. */
    colorPropertyName?: string;
}

/** A record offered with a dot in its colour. */
export const ColorfulLookupManyOption = (props: IColorfulLookupManyOptionProps) => {
    const { colorPropertyName = 'color', ...optionProps } = props;
    const theme = useTheme();
    const color = getRawValue(props.data, colorPropertyName) ?? theme.palette.neutralLight;
    const styles = useMemo(() => getColorfulLookupManyOptionStyles(color), [color]);
    return <components.Option {...optionProps}>
        <div className={styles.option}>
            <span className={styles.dot} />
            {props.children}
        </div>
    </components.Option>;
};
