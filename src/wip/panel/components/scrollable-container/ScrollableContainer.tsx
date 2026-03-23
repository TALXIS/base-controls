import React, { useMemo } from "react"
import { Container } from "../../../scrollable-container/components"
import { getScrollableContainerStyles } from "./styles";
import { getClassNames } from "../../../../utils";

export const ScrollableContainer = (props: React.HTMLProps<HTMLDivElement>) => {
    const styles = useMemo(() => getScrollableContainerStyles(), []);

    return <Container {...props} className={getClassNames([styles.scrollableContainer, props.className])} />
}