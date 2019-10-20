import "reflect-metadata";
import chai from "chai";
import sinon_chai from "sinon-chai";

import { Container } from "../../src";
import { Car } from "./Car";

chai.should();
chai.use(sinon_chai);

describe("Service Decorator", () => {
  it("should throw Error: factory function with arguments", () => {
    Container.get<Car>(Car).engine.type.should.be.equal("V6");
    Container.get<Car>(Car).wheel.count.should.be.equal(5);
  });
});
