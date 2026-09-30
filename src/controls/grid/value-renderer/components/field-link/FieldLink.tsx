import { useMemo } from "react";
import { Link } from "@fluentui/react";
import { useLineClamp } from "../../useLineClamp";
import { getFieldLinkStyles } from "./styles";

export interface IFieldLinkProps {
    text: string | null;
    /** Where it navigates to. Without one it is a link that only calls back. */
    href?: string;
    onClick?: () => void;
    isMultiline?: boolean;
}

/** A value as a link: an address it navigates to, a record it opens, or neither. */
export const FieldLink = (props: IFieldLinkProps) => {
    const { ref, lines } = useLineClamp(!!props.isMultiline);
    const styles = useMemo(() => getFieldLinkStyles(!!props.isMultiline, lines), [props.isMultiline, lines]);

    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        if (!props.onClick) {
            return;
        }
        //a click that opens a record is not navigation the browser should also try
        event.preventDefault();
        event.stopPropagation();
        props.onClick();
    };

    return <Link
        elementRef={ref}
        className={styles.link}
        href={props.href}
        //the frame the host put the grid in is rarely where an address belongs
        target={props.href ? '_blank' : undefined}
        title={props.text ?? undefined}
        onClick={onClick}>
        {props.text}
    </Link>;
};
