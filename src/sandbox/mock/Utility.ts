export class Utility implements ComponentFramework.Utility {
    getEntityMetadata(entityName: string, attributes?: string[] | undefined): Promise<ComponentFramework.PropertyHelper.EntityMetadata> {
        return {
            DisplayName: entityName,
        } as any
    }
    hasEntityPrivilege(entityTypeName: string, privilegeType: ComponentFramework.PropertyHelper.Types.PrivilegeType, privilegeDepth: ComponentFramework.PropertyHelper.Types.PrivilegeDepth): boolean {
        throw new Error("Method not implemented.");
    }
    lookupObjects(lookupOptions: ComponentFramework.UtilityApi.LookupOptions): Promise<ComponentFramework.LookupValue[]> {
        throw new Error("Method not implemented.");
    }

}