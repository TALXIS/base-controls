import { useMemo } from "react";
import { getScrollableContainerStyles } from "./styles";
import { getClassNames } from "../../../../utils";

export const ScrollableContainer = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    const styles = useMemo(() => getScrollableContainerStyles(), []);
    
    return <div className={getClassNames([styles.scrollableContainer, props.className])} {...props} />
}