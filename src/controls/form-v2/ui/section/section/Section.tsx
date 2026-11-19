import { useMemo } from "react";
import { Card, ICardComponents } from "@ui";
import { getFormV2UiSectionStyles } from "./styles";

export interface IFormV2UiSectionProps {
    /** Hides the section with CSS; what is inside stays mounted. */
    hidden?: boolean;
    /** Its header, body and footer. */
    children?: React.ReactNode;
    /** Replacements for the card's slots. */
    components?: Partial<ICardComponents>;
}

/** A section's box: a card that can be hidden. */
export const FormV2UiSection = (props: IFormV2UiSectionProps) => {
    const styles = useMemo(() => getFormV2UiSectionStyles(!!props.hidden), [props.hidden]);
    return <Card className={styles.section} components={props.components}>{props.children}</Card>;
};
