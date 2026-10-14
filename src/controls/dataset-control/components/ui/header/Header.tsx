import { useMemo, useState } from "react";
import { HeaderItems } from "../header-item";
import { getClassNames } from "@utils";
import { HeaderUiComponents, IHeaderUiComponents } from "./components";
import { SetIsolatedHeaderItemContext, IsolatedHeaderItemContext } from "./context";
import { getHeaderUiStyles } from "./styles";

/** Props for the header, as plain UI. */
export interface IHeaderUiProps {
    /** The start and end regions. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IHeaderUiComponents>;
}

/** The row above the records, holding the view switcher, ribbon, quick find and other commands. */
export const Header = (props: IHeaderUiProps) => {
    const components = { ...HeaderUiComponents, ...props.components };
    const [isolated, setIsolated] = useState<Element>();
    const styles = useMemo(() => getHeaderUiStyles(), []);

    return <SetIsolatedHeaderItemContext.Provider value={setIsolated}>
        <IsolatedHeaderItemContext.Provider value={isolated}>
            {components.onRenderContainer({
                className: getClassNames([styles.datasetControlHeader, props.className]),
                children: <HeaderItems>{props.children}</HeaderItems>,
            })}
        </IsolatedHeaderItemContext.Provider>
    </SetIsolatedHeaderItemContext.Provider>;
};
