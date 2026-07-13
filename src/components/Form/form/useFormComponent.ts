import { useMemo, useRef } from "react";
import { useForm } from "./context";
import { ICell, IForm, IFormCellProps, IFormSectionProps, IFormTabProps, ISection, ITab, Section, Tab } from "./FormModel";

type FormComponentType = 'Section' | 'Tab' | 'Cell';
type FormComponentParentMap = {
    Form: IForm;
    Section: ISection;
    Tab: ITab;
};
type FormComponentParentName = keyof FormComponentParentMap;
type IFormComponentParent<TParentName extends FormComponentParentName = FormComponentParentName> = {
    [TName in TParentName]: {
        name: TName;
        instance: FormComponentParentMap[TName];
    };
}[TParentName];


interface IGetMethodsParams {
    id: string;
    type: FormComponentType;
    parent: IFormComponentParent;
    form: IForm;
}




const getMethods = (params: IGetMethodsParams) => {
    const { id, type, parent, form } = params;
    switch (type) {
        case 'Section': {
            let tabParent: ITab = parent.instance as ITab;
            if (parent.name !== 'Tab') {
                tabParent = new Tab({
                    id: crypto.randomUUID(),
                });
                form.addTab(tabParent);
            }
            return {
                getter: (id: string) => tabParent.getSection(id),
                adder: (props: IFormSectionProps) => tabParent.addSection({
                    ...props,
                    id: id
                }),
            }
        }
        case 'Tab': {
            if (parent.name !== 'Form') {
                throw new Error(`[Form] Cannot add Tab to parent of type ${parent.name}.`);
            }
            return {
                getter: (id: string) => parent.instance.getTab(id),
                adder: (props: IFormTabProps) => parent.instance.addTab(props),
            }
        }
        case 'Cell': {
            let sectionParent: ISection = parent.instance as ISection;
            if (parent.name !== 'Section') {
                sectionParent = new Section({
                    id: crypto.randomUUID(),
                });
                const tab = new Tab({
                    id: crypto.randomUUID(),
                });
                tab.addSection(sectionParent);
                form.addTab(tab);
            }
            return {
                getter: (id: string) => sectionParent.getCell(id),
                adder: (props: IFormCellProps) => sectionParent.addCell({
                    ...props,
                    id: id
                }),
            }
        }
    }
};

export function useFormComponent(type: 'Section', props: IFormSectionProps, parent?: IFormComponentParent): ISection;
export function useFormComponent(type: 'Tab', props: IFormTabProps, parent?: IFormComponentParent): ITab;
export function useFormComponent(type: 'Cell', props: IFormCellProps, parent?: IFormComponentParent): ICell;
export function useFormComponent(
    type: FormComponentType,
    props: IFormSectionProps | IFormTabProps | IFormCellProps,
    parent?: IFormComponentParent

): ISection | ITab | ICell {
    const id = useMemo(() => props.id ?? window.crypto.randomUUID(), []);
    const form = useForm();

    parent = parent ?? {
        name: 'Form',
        instance: form
    }

    const { getter, adder } = getMethods({
        form: form,
        id: id,
        type: type,
        parent: parent!
    }) as {
        getter: (id: string) => ISection | ITab | ICell | null;
        adder: (props: IFormSectionProps | IFormTabProps | IFormCellProps) => ISection | ITab | ICell;
    };
    let component = getter(id);
    if (!component) {
        component = adder(props);
    }

    component?.update(props as any);
    if (!component) {
        return adder(props);
    }
    return component;
}