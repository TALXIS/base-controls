import { IGridColumn } from "../interfaces/IGridColumn";
import { GridDependency } from "./GridDependency";

export class Metadata extends GridDependency {
    public async get(column: IGridColumn): Promise<ComponentFramework.PropertyHelper.EntityMetadata> {
        if(column.entityAliasName) {
            const linkedEntity = this._grid.dataset.linking.getLinkedEntities().find(x => x.alias === column.entityAliasName)!;
            return await this._grid.pcfContext.utils.getEntityMetadata(linkedEntity.name, [column.attributeName]);
        }
        else {
            return await this._grid.pcfContext.utils.getEntityMetadata(this._grid.dataset.getTargetEntityType(), [column.attributeName]);
        }
    }
    public async getOptions(column: IGridColumn): Promise<[number | boolean, ComponentFramework.PropertyHelper.OptionMetadata[]]> {
        const columnMetadata = await this.get(column);
        const options = columnMetadata.Attributes.get(column.attributeName).attributeDescriptor.OptionSet as ComponentFramework.PropertyHelper.OptionMetadata[]
        const defaultValue = columnMetadata.Attributes.get(column.attributeName).DefaultFormValue as number | boolean;
        return [defaultValue, options];
    }
}
