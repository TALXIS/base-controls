import { ReactNode, useMemo } from "react";
import { Icon, Link, useTheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { getLookupManyPillStyles } from "./styles";

/** Props for {@link LookupManyPill}. */
export interface ILookupManyPillProps {
    reference: ComponentFramework.EntityReference;
    /** Opens the record; the pill is plain text without it. */
    onOpen?: (reference: ComponentFramework.EntityReference) => void;
    /** Removes the record; the pill has no remove button without it. */
    onRemove?: (reference: ComponentFramework.EntityReference) => void;
    /** The colour it is tinted with; the theme's neutral one when left out. */
    color?: string;
    className?: string;
    /** Drawn in place of the record's name. */
    children?: ReactNode;
}

/** One record of a lookup-many value. */
export const LookupManyPill = (props: ILookupManyPillProps) => {
    const { reference, onOpen, onRemove } = props;
    const theme = useTheme();
    const color = props.color || theme.palette.neutralSecondary;
    const styles = useMemo(() => getLookupManyPillStyles(theme, color), [theme, color]);
    const content = props.children ?? <span title={reference.name} className={styles.label}>{reference.name}</span>;

    //a picker takes the mouse down for itself
    const onOpenClick = (event: React.MouseEvent) => {
        event.preventDefault();
        onOpen?.(reference);
    };

    return <span className={getClassNames([styles.pill, props.className])}>
        {onOpen ? <Link className={styles.link} onMouseDown={event => event.stopPropagation()} onClick={onOpenClick}>{content}</Link> : content}
        {onRemove && <span role="button" aria-label={`Remove ${reference.name}`} className={styles.remove} onMouseDown={event => event.stopPropagation()} onClick={() => onRemove(reference)}>
            <Icon iconName="Cancel" className={styles.removeIcon} />
        </span>}
    </span>;
};
