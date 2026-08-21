import { ILookupManyProps, LookupMany } from "../LookupMany";
import { DEFAULT_TAG_LOOKUP_MANY_COMPONENTS } from "./components";
import { ColorfulLookupManyPropsContext } from "./context";

export interface IColorfulLookupManyProps extends ILookupManyProps {
    colorPropertyName?: string;
}

export const ColorfulLookupMany = (props: IColorfulLookupManyProps) => {
    const components = { ...DEFAULT_TAG_LOOKUP_MANY_COMPONENTS, ...props.components };
    return <ColorfulLookupManyPropsContext.Provider value={props}>
        <LookupMany
            {...props}
            components={components}
        />
    </ColorfulLookupManyPropsContext.Provider>
}
