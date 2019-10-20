import { Engine, Wheel } from "./index";
import { CarFactory } from "./CarFactory";
import { Service } from "../../src/";

@Service({ factory: [CarFactory, "createCar"] })
export class Car {
  constructor (public engine: Engine, public wheel: Wheel) {}
}
