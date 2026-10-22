import { Fragment, useMemo, useRef, useState } from "react";
import { useTheme } from "@fluentui/react";
import { TooltipHost } from "@ui";
import { useResizeEffect } from "@utils";
import { ILookupManyPillsComponents, LookupManyPillsComponents } from "./components";
import { getLookupManyPillsStyles, LOOKUP_MANY_PILLS_GAP, LOOKUP_MANY_PILLS_PADDING } from "./styles";

/** Props for {@link LookupManyPills}. */
export interface ILookupManyPillsProps {
    value: ComponentFramework.EntityReference[];
    /** Opens a pill's record; pills are plain text without it. */
    onOpen?: (reference: ComponentFramework.EntityReference) => void;
    components?: Partial<ILookupManyPillsComponents>;
}

/** A lookup-many value on one line, the records that do not fit counted in a hoverable `+N`. */
export const LookupManyPills = (props: ILookupManyPillsProps) => {
    const { value, onOpen } = props;
    const components = { ...LookupManyPillsComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getLookupManyPillsStyles(theme), [theme]);
    const rootRef = useRef<HTMLDivElement>(null);
    const measurerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(value.length);

    useResizeEffect(rootRef, () => {
        const root = rootRef.current;
        const measurer = measurerRef.current;
        if (!root || !measurer) {
            return;
        }
        const widths = [...measurer.children].map(child => child.getBoundingClientRect().width + LOOKUP_MANY_PILLS_GAP);
        const overflowWidth = widths.pop() ?? 0;
        const availableWidth = root.clientWidth - 2 * LOOKUP_MANY_PILLS_PADDING;
        let usedWidth = 0;
        let count = 0;
        for (const [index, width] of widths.entries()) {
            const overflowRoom = index < widths.length - 1 ? overflowWidth : 0;
            if (usedWidth + width + overflowRoom > availableWidth + LOOKUP_MANY_PILLS_GAP) {
                break;
            }
            usedWidth += width;
            count++;
        }
        setVisibleCount(Math.min(value.length, Math.max(1, count)));
    });

    const visible = value.slice(0, visibleCount);
    const hidden = value.slice(visibleCount);

    return <div ref={rootRef} className={styles.root}>
        {visible.map(reference => <Fragment key={reference.id.guid}>{components.onRenderPill({ reference, onOpen })}</Fragment>)}
        {hidden.length > 0 && <TooltipHost closeDelay={300} content={<div className={styles.overflowList}>
            {hidden.map(reference => <Fragment key={reference.id.guid}>{components.onRenderPill({ reference, onOpen })}</Fragment>)}
        </div>}>
            <span className={styles.overflow}>+{hidden.length}</span>
        </TooltipHost>}
        <div ref={measurerRef} className={styles.measurer} aria-hidden>
            {value.map(reference => <Fragment key={reference.id.guid}>{components.onRenderPill({ reference })}</Fragment>)}
            <span className={styles.overflow}>+{value.length}</span>
        </div>
    </div>;
};
