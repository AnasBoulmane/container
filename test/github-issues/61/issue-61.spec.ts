import "reflect-metadata";

import chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service } from "../../../src";

chai.should();
chai.use(sinon_chai);

describe("github issues > #61 Scoped container creates new instance of service every time", () => {
  beforeEach(() => Container.reset());

  it("should work properly", () => {
    @Service()
    class Car {
      public serial = Math.random();
    }

    const fooContainer = Container.of("foo");
    const barContainer = Container.of("bar");

    const car1Serial = Container.get<Car>(Car).serial;
    const car2Serial = Container.get<Car>(Car).serial;

    const fooCar1Serial = fooContainer.get<Car>(Car).serial;
    const fooCar2Serial = fooContainer.get<Car>(Car).serial;

    const barCar1Serial = barContainer.get<Car>(Car).serial;
    const barCar2Serial = barContainer.get<Car>(Car).serial;

    car1Serial.should.be.equal(car2Serial);
    fooCar1Serial.should.be.equal(fooCar2Serial);
    barCar1Serial.should.be.equal(barCar2Serial);

    car1Serial.should.not.be.equal(fooCar1Serial);
    car1Serial.should.not.be.equal(barCar1Serial);
    fooCar1Serial.should.not.be.equal(barCar1Serial);

    (Container.of({}).get<Car>(Car).serial === Container.of({}).get<Car>(Car).serial).should.be.false;
  });
});
