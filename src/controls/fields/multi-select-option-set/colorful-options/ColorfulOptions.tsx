import { useMemo } from "react";
import { getColorfulOptionsStyles } from "./styles";
import { IContext, IMultiSelectOptionSetProperty } from "@interfaces";
import { useTheme } from "@fluentui/react";
import { OptionTag } from "@ui";

interface IColorfulOptionsProps {
    value: IMultiSelectOptionSetProperty;
    context: IContext;
}

export const ColorfulOptions = (props: IColorfulOptionsProps) => {
    const styles = useMemo(() => getColorfulOptionsStyles(), []);
    const { value } = props;
    const theme = useTheme();
    const options = value.attributes.Options;

    return (
        <div className={styles.root}>
            {value.raw?.map((selected, index) => {
                const option = options.find(option => option.Value == selected);
                return <OptionTag
                    key={index}
                    label={option?.Label}
                    //an option with no colour of its own carries an empty string rather than nothing
                    color={option?.Color || theme.palette.neutralLight} />;
            })}
        </div>
    );
}
