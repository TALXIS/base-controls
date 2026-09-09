import { Fragment, useMemo } from "react";
import { OptionSetRendererComponents, IOptionSetRendererComponents } from "./components";
import { getOptionSetRendererStyles } from "./styles";

export interface IOptionSetRendererProps {
    /** The options to draw, in the order they should read. */
    options: IOptionSetRendererOption[];
    /** How they sit in the space they are given. Left, unless told otherwise. */
    alignment?: 'left' | 'center' | 'right';
    components?: Partial<IOptionSetRendererComponents>;
}

/** What an option renderer is handed. */
export interface IOptionProps {
    option: IOptionSetRendererOption;
}

/** One option, as this component needs it. */
export interface IOptionSetRendererOption {
    /** What it reads as. */
    label: string;
    /** What identifies it, and what tells it apart from the others across renders. */
    value?: string | number;
    /** The colour it is drawn in. Without one it is drawn in the colour of whatever holds it. */
    color?: string;
}

/**
 * A set of options, drawn.
 *
 * Takes options rather than a value: working out which options a value selected needs the data type, and
 * that belongs to whoever knows the column.
 */
export const OptionSetRenderer = (props: IOptionSetRendererProps) => {
    const styles = useMemo(() => getOptionSetRendererStyles(props.alignment ?? 'left'), [props.alignment]);
    const components = { ...OptionSetRendererComponents, ...props.components };

    return <div className={styles.optionSetRoot}>
        {props.options.map((option, index) => <Fragment key={option.value ?? `${option.label}-${index}`}>
            {components.onRenderOption({ option: option })}
        </Fragment>)}
    </div>;
};
