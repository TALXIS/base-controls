import { Attribute } from "@talxis/client-libraries";
import { GridDependency } from "./GridDependency";

export class Metadata extends GridDependency {
    public async get(columnName: string): Promise<ComponentFramework.PropertyHelper.EntityMetadata> {
        const entityAliasName = Attribute.GetLinkedEntityAlias(columnName);
        const attributeName = Attribute.GetNameFromAlias(columnName);
        if(entityAliasName) {
            const linkedEntity = this._grid.dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!;
            return await this._grid.pcfContext.utils.getEntityMetadata(linkedEntity.name, [attributeName]);
        }
        else {
            return await this._grid.pcfContext.utils.getEntityMetadata(this._grid.dataset.getTargetEntityType(), [attributeName]);
        }
    }
    public async getOptions(columnName: string): Promise<[number | boolean, ComponentFramework.PropertyHelper.OptionMetadata[]]> {
        const columnMetadata = await this.get(columnName);
        const attributeName = Attribute.GetNameFromAlias(columnName);
        const options = columnMetadata.Attributes.get(attributeName).attributeDescriptor.OptionSet as ComponentFramework.PropertyHelper.OptionMetadata[]
        const defaultValue = columnMetadata.Attributes.get(attributeName).DefaultFormValue as number | boolean;
        return [defaultValue, options];
    }
}
