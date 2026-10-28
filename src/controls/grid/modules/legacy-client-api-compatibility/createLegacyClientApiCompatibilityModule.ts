import { IGridModule } from "../../interfaces";
import { GridLegacyClientApiCompatibility, IGridLegacyClientApiCompatibility } from "./GridLegacyClientApiCompatibility";

export interface ILegacyClientApiCompatibilityModule extends IGridModule<'legacyClientApiCompatibility'> { }

declare module "../../interfaces" {
    interface IGridModuleMap {
        /** What legacy scripts set on a record's fields. */
        legacyClientApiCompatibility: IGridLegacyClientApiCompatibility;
    }
}

/** Builds the module that carries what legacy scripts set on a record's fields into the grid. */
export const createLegacyClientApiCompatibilityModule = (): ILegacyClientApiCompatibilityModule => ({
    name: 'legacyClientApiCompatibility',
    onLoad: ({ services }) => new GridLegacyClientApiCompatibility({ services }),
    onDestroy: compatibility => compatibility.destroy(),
});
