import { components, OptionProps } from "react-select";
import type { LookupManyAppearance } from "../../LookupMany";
import { ColorfulLookupManyOption, ColorfulLookupManyPill, ILookupManyPillProps, LookupManyPill, PersonLookupManyOption, PersonLookupManyPill } from "../ui";

type Reference = ComponentFramework.EntityReference;

export interface ILookupManyVariantComponents {
    onRenderPill: (props: ILookupManyPillProps) => JSX.Element;
    onRenderOption: (props: OptionProps<Reference, true, never>) => JSX.Element;
}

/** How a column draws its records, by the appearance the module maps it to. */
export const getLookupManyComponents = (appearance: LookupManyAppearance = { type: 'plain' }): ILookupManyVariantComponents => {
    switch (appearance.type) {
        case 'colorful': {
            return {
                onRenderPill: props => <ColorfulLookupManyPill {...props} colorPropertyName={appearance.colorPropertyName} />,
                onRenderOption: props => <ColorfulLookupManyOption {...props} colorPropertyName={appearance.colorPropertyName} />,
            };
        }
        case 'people': {
            return {
                onRenderPill: props => <PersonLookupManyPill {...props} imageUrlPropertyName={appearance.imageUrlPropertyName} />,
                onRenderOption: props => <PersonLookupManyOption {...props} imageUrlPropertyName={appearance.imageUrlPropertyName} />,
            };
        }
        case 'plain': {
            return {
                onRenderPill: props => <LookupManyPill {...props} />,
                onRenderOption: props => <components.Option {...props} />,
            };
        }
    }
};
