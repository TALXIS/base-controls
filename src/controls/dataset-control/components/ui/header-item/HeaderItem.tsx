import { useContext, useMemo, useRef } from "react";
import { getClassNames, useCompactItem } from "@utils";
import { IsolatedHeaderItemContext } from "../header/context";
import { HeaderItemContext } from "./context";
import { getHeaderItemStyles } from "./styles";

/** The box around one child of a header region, which hides while another part has the header to itself. */
export const HeaderItem = (props: { children?: React.ReactNode }) => {
    const styles = useMemo(() => getHeaderItemStyles(), []);
    const ref = useRef<HTMLDivElement>(null);
    const isolated = useContext(IsolatedHeaderItemContext);
    const isHidden = !!isolated && !ref.current?.contains(isolated);
    useCompactItem();

    return <HeaderItemContext.Provider value={ref}>
        <div ref={ref} className={getClassNames([styles.headerItem, isHidden ? styles.hidden : undefined])}>{props.children}</div>
    </HeaderItemContext.Provider>;
};
