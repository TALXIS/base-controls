import { Callout as CalloutBase, ICalloutProps, ISearchBoxProps, SearchBox as SearchBoxBase } from "@fluentui/react";

export interface IQuickFindComponents {
    SearchBox: (props: ISearchBoxProps) => JSX.Element;
    Callout: (props: ICalloutProps) => JSX.Element;
}

export const SearchBox = (props: ISearchBoxProps) => {
    return <SearchBoxBase {...props} />
}

export const Callout = (props: ICalloutProps) => {
    return <CalloutBase {...props} />
}

export const components: IQuickFindComponents = {
    SearchBox: SearchBox,
    Callout: Callout
}       