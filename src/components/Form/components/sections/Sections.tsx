import * as React from "react";
import { useMemo } from "react";
import { SectionsContext } from "./context";
import { getSectionsStyles } from "./styles";

export interface IFormSectionsProps {
    children?: React.ReactNode;
}

export const Sections = ({ children }: IFormSectionsProps) => {
    const styles = useMemo(() => getSectionsStyles(), []);

    return <div data-id="form-sections" className={styles.sections}>
        <SectionsContext.Provider value={true}>
            {children}
        </SectionsContext.Provider>
    </div>
};
