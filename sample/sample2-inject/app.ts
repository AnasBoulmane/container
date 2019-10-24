import "reflect-metadata";
import { Container } from "../../src";
import { CoffeeMaker } from "./CoffeeMaker";

const coffeeMaker = Container.get<CoffeeMaker>(CoffeeMaker);
coffeeMaker.make();
