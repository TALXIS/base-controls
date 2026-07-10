import * as React from "react";
import { ResponsiveLayoutGrid } from "./ResponsiveLayoutGrid";
import { SectionsContext } from "./SectionsContext";
import {
    buildSequentialResponsiveLayouts,
    DEFAULT_STACK_LAYOUT_COLS,
    mergeResponsiveCols,
    normalizeLayoutKey,
    type FormResponsiveCols,
} from "./layout";

type SectionChildProps = {
    visible?: boolean;
};

export interface IFormSectionsProps {
    className?: string;
    responsiveCols?: Partial<FormResponsiveCols>;
    rowHeight?: number;
    margin?: readonly [number, number];
    containerPadding?: readonly [number, number];
    children?: React.ReactNode;
}

export const Sections: React.FC<IFormSectionsProps> = ({
    className,
    responsiveCols,
    rowHeight = 48,
    margin = [0, 16],
    containerPadding = [0, 0],
    children,
}) => {
    const sectionChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<SectionChildProps> => React.isValidElement<SectionChildProps>(child))
        .filter((child) => child.props.visible !== false);

    if (sectionChildren.length === 0) {
        return null;
    }

    const cols = mergeResponsiveCols(DEFAULT_STACK_LAYOUT_COLS, responsiveCols);
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
                className={className}
                layouts={layouts}
                cols={cols}
                rowHeight={rowHeight}
                margin={margin}
                containerPadding={containerPadding}
            >
                {sectionChildren}
            </ResponsiveLayoutGrid>
        </SectionsContext.Provider>
    );
};
