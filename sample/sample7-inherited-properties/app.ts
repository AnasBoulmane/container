import "reflect-metadata";
import { Container } from "../../src/index";
import { BmwCar } from "./BmwCar";
import { PorsheCar } from "./PorsheCar";

// drive bmw
const bmwCar = Container.get(BmwCar);
console.log(bmwCar);
bmwCar.drive();

// drive porshe
const porsheCar = Container.get(PorsheCar);
porsheCar.drive();
