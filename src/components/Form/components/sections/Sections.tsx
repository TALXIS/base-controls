import * as React from "react";
import { SectionsContext } from "./context";
import { getSectionsStyles } from "./styles";
import { useColumnContext } from "../column";

type SectionChildProps = {
    visible?: boolean;
    section?: {
        visible?: boolean;
    };
};

export interface IFormSectionsProps {
    children?: React.ReactNode;
}

export const Sections = ({ children }: IFormSectionsProps) => {
    useColumnContext();

    const sectionChildren = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<SectionChildProps> => React.isValidElement<SectionChildProps>(child))
        .filter((child) => child.props.visible !== false && child.props.section?.visible !== false);

    if (sectionChildren.length === 0) {
        return null;
    }

    const styles = getSectionsStyles();

    return (
        <SectionsContext.Provider value={true}>
            <div data-id="form-sections" className={styles.root}>
                {sectionChildren}
            </div>
        </SectionsContext.Provider>
    );
};
