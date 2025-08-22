import { useMemo } from "react";
import { IValueRendererProps } from "../interfaces";
import { Link, Text } from '@fluentui/react';
import { getValueRendererStyles } from "./styles";
import { ColorfulOptionSetValueRenderer } from "./ColorfulOptionSetValueRenderer/ColorfulOptionSetValueRenderer";
import { useModel } from "../useModel";
import { FileRenderer } from "./FileRenderer/FileRenderer";
import { getClassNames } from "@talxis/react-components";

export const ValueRenderer = (props: IValueRendererProps) => {
    const model = useModel();
    const theme = model.getControlTheme();
    const formattedValue = model.getFormattedValue();
    const linkProps = model.getLinkProps();
    const isFile = model.isFile();
    const colorfulOptionSet = model.getColorfulOptionSet();
    const styles = useMemo(() => getValueRendererStyles({
        theme: theme,
        isMultiline: model.isMultiline(),
        makeBold: !!model.getAggregationLabel() || !!model.getFormattedAggregatedValue()
    }), [theme,
        model.isMultiline(),
        model.getAggregationLabel(),
        !!model.getAggregationLabel() || !!model.getFormattedAggregatedValue()
    ]);

    if (isFile) {
        return <FileRenderer onRenderFile={props.onRenderFile} />
    }

    else if (linkProps) {
        return props.onRenderLink({
            ...linkProps,
            className: styles.link,
            as: 'a'
        }, (props) => {
            return <Link {...props} />
        })
    }

    else if (colorfulOptionSet) {
        return <ColorfulOptionSetValueRenderer
            optionSet={colorfulOptionSet}
            onRenderColorfulOptionSet={props.onRenderColorfulOptionSet}
        />
    }
    else {
        return props.onRenderText({
            className: getClassNames([styles.text, !formattedValue.value ? styles.placeholder : undefined]),
            children: formattedValue.placeholder
        }, (props) => {
            return <Text {...props}>{formattedValue.placeholder}</Text>;
        })
    }
}