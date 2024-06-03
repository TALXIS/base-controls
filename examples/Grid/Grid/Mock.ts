import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class Mock {
    private _control: ComponentFramework.StandardControl<IInputs, IOutputs>;
    private _selectedRecordIds: string[] = [];

    constructor(control: ComponentFramework.StandardControl<IInputs, IOutputs>) {
        this._control = control;
    }
    public injectDatasetApis(context: ComponentFramework.Context<IInputs>) {
        context.factory.requestRender = () => {
            this._control.updateView(context);
        };
        //@ts-ignore - missing types
        context.utils.getEntityMetadata = () => {
            return {
                Attributes: {
                    get: () => {
                        return {
                            attributeDescriptor: {
                                RequiredLevel: 2,
                                IsValidForUpdate: true
                            }
                        };
                    }
                }
            };
        };
        context.parameters.Grid = {
            ...context.parameters.Grid,
            columns: [...context.parameters.Grid.columns],
            sorting: context.parameters.Grid.sorting ?? [],
            //@ts-ignore - not part of types
            paging: {...context.parameters.Grid.paging, pageNumber: 1, pageSize: 25},
            refresh: () => {
                this._control.updateView(context);
            },
            getSelectedRecordIds: () => {
                return this._selectedRecordIds;
            },
            setSelectedRecordIds: (ids: string[]) => {
                this._selectedRecordIds = ids;
                this._control.updateView(context);
            }
        };
        //@ts-ignore - typescript
        for(const [key, value] of Object.entries(context.parameters.Grid.records)) {
            //@ts-ignore / misssing implementation
            context.parameters.Grid.records[key].setValue = () => {
                context.factory.requestRender();
            };
        }
    }
}