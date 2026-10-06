import { IGridModule } from "../../interfaces";
import { GridLegacyClientApiCompatibility } from "./GridLegacyClientApiCompatibility";

/** Builds the module that carries what legacy scripts set on a record's fields into the grid. */
export const createLegacyClientApiCompatibilityModule = (): IGridModule => ({
    onRegister: ({ services }) => {
        new GridLegacyClientApiCompatibility({ services });
    },
});
