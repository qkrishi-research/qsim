import type { ModuleImplementation } from "../types";
import { Scene } from "./Scene";
import { Controls } from "./Controls";
import { StatePanel } from "./StatePanel";

export const superpositionModule: ModuleImplementation = {
  Scene,
  Controls,
  StatePanel,
};
