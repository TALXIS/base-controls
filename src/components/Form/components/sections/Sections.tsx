import * as React from "react";
import { ResponsiveLayoutGrid } from "../shared";
import { SectionsContext } from "./context";
import { useColumnContext } from "../column";
import {
    buildSequentialResponsiveLayouts,
    DEFAULT_STACK_LAYOUT_COLS,
    mergeResponsiveCols,
    normalizeLayoutKey,
    type FormResponsiveCols,
} from "../shared";

type SectionChildProps = {
    visible?: boolean;
    section?: {
        visible?: boolean;
    };
};

export interface IFormSectionsProps {
    children?: React.ReactNode;
}

export const Sections: React.FC<IFormSectionsProps> = ({ children }) => {
    useColumnContext();

    const sectionChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<SectionChildProps> => React.isValidElement<SectionChildProps>(child))
        .filter((child) => child.props.visible !== false && child.props.section?.visible !== false);

    if (sectionChildren.length === 0) {
        return null;
    }

    const cols = mergeResponsiveCols(DEFAULT_STACK_LAYOUT_COLS);
    const layouts = buildSequentialResponsiveLayouts(
        sectionChildren.map((child, index) => ({
            key: normalizeLayoutKey(child.key, `form-section-${index}`),
            span: 1,
        })),
        cols,
        () => 1,
    );

    return (
        <SectionsContext.Provider value={true}>
            <ResponsiveLayoutGrid
                dataId="form-sections"
                layouts={layouts}
                cols={cols}
                rowHeight={48}
                margin={[0, 16]}
                containerPadding={[0, 0]}
            >
                {sectionChildren}
            </ResponsiveLayoutGrid>
        </SectionsContext.Provider>
    );
};
