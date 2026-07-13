import { IFormSectionProps, IFormTabProps } from "../components";
import { useForm } from "./context";
import { IForm, ISection, ITab } from "./FormModel";

type FormComponentType = 'Section' | 'Tab';

const getMethods = (type: FormComponentType, form: IForm | ISection) => {
    if (type === 'Section') {
        return {
            getter: (id: string) => form.getSection(id),
            adder: (props: IFormSectionProps) => form.addSection(props),
        };
    } else {
        return {
            getter: (id: string) => form.getTab(id),
            adder: (props: IFormTabProps) => form.addTab(props),
        };
    }       
};

export function useFormComponent(type: 'Section', props: IFormSectionProps): ISection;
export function useFormComponent(type: 'Tab', props: IFormTabProps): ITab;
export function useFormComponent(
    type: FormComponentType,
    props: IFormSectionProps | IFormTabProps,
): ISection | ITab {
    let id = props.id;
    const form = useForm();
    
    const { getter, adder } = getMethods(type, form) as {
        getter: (id: string) => ISection | ITab | null;
        adder: (props: IFormSectionProps | IFormTabProps) => ISection | ITab;
    };

    if (!id) {
        const newComponent = adder(props);
        id = newComponent.id;
    }
    const component = getter(id);

    component?.update(props as any);
    if (!component) {
        return adder(props);
    }

    return component;
}