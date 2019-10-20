import "reflect-metadata";
import { Container } from "../../src/index";
import { CarFactory } from "./CarFactory";
import { Counter } from "./Counter";

const carFactory = Container.get<CarFactory>(CarFactory);
carFactory.create();

const counter = Container.get<Counter>(Counter);
counter.increase();
counter.increase();
counter.increase();
console.log(counter.getCount());
