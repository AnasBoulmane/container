import { Engine, Wheel } from "./index";
import { Car } from "./Car";

export class CarFactory {
  createCar (engine: Engine, wheel: Wheel): Car {
    engine.type = "V6";
    return new Car(engine, wheel);
  }
}
