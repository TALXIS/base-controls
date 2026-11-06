import { components, OptionProps } from "react-select";
import type { LookupManyAppearance } from "../../LookupMany";
import { LookupManyUiColorfulOption, LookupManyUiColorfulPill, ILookupManyUiPillProps, LookupManyUiPill, LookupManyUiPersonOption, LookupManyUiPersonPill } from "../../ui";

type Reference = ComponentFramework.EntityReference;

export interface ILookupManyAppearanceComponents {
    onRenderPill: (props: ILookupManyUiPillProps) => JSX.Element;
    onRenderOption: (props: OptionProps<Reference, true, never>) => JSX.Element;
}

/** How a column draws its records, by the appearance the module maps it to. */
export const getLookupManyAppearanceComponents = (appearance: LookupManyAppearance = { type: 'plain' }): ILookupManyAppearanceComponents => {
    switch (appearance.type) {
        case 'colorful': {
            return {
                onRenderPill: props => <LookupManyUiColorfulPill {...props} colorPropertyName={appearance.colorPropertyName} />,
                onRenderOption: props => <LookupManyUiColorfulOption {...props} colorPropertyName={appearance.colorPropertyName} />,
            };
        }
        case 'people': {
            return {
                onRenderPill: props => <LookupManyUiPersonPill {...props} imageUrlPropertyName={appearance.imageUrlPropertyName} />,
                onRenderOption: props => <LookupManyUiPersonOption {...props} imageUrlPropertyName={appearance.imageUrlPropertyName} />,
            };
        }
        case 'plain': {
            return {
                onRenderPill: props => <LookupManyUiPill {...props} />,
                onRenderOption: props => <components.Option {...props} />,
            };
        }
    }
};
