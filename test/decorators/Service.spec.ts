/* tslint:disable:max-classes-per-file */
import "reflect-metadata";
import * as chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service } from "../../src";

chai.should();
chai.use(sinon_chai);

describe("Service Decorator", () => {
  beforeEach(() => Container.reset());

  it("should register class in the container, and its instance should be retrievable", () => {
    @Service()
    class TestService {}

    @Service("super.service")
    class NamedService {}

    Container.get(TestService).should.be.instanceOf(TestService);
    Container.get(TestService).should.not.be.instanceOf(NamedService);
  });

  it("should register class in the container with given name, and its instance should be retrievable", () => {
    @Service()
    class TestService {}

    @Service("super.service")
    class NamedService {}

    Container.get("super.service").should.be.instanceOf(NamedService);
    Container.get("super.service").should.not.be.instanceOf(TestService);
  });

  it("should register class in the container, and its parameter dependencies should be properly initialized", () => {
    @Service()
    class TestService {}

    @Service()
    class SecondTestService {}

    @Service()
    class TestServiceWithParameters {
      constructor (public testClass: TestService, public secondTest: SecondTestService) {}
    }

    Container.get(TestServiceWithParameters).should.be.instanceOf(TestServiceWithParameters);
    Container.get<TestServiceWithParameters>(TestServiceWithParameters).testClass.should.be.instanceOf(TestService);
    Container.get<TestServiceWithParameters>(TestServiceWithParameters).secondTest.should.be.instanceOf(
      SecondTestService,
    );
  });

  it("should support factory functions", () => {
    class Engine {
      constructor (public serialNumber: string) {}
    }

    function createCar () {
      return new Car("BMW", new Engine("A-123"));
    }

    @Service({ factory: createCar })
    class Car {
      constructor (public name: string, public engine: Engine) {}
    }

    Container.get<Car>(Car).name.should.be.equal("BMW");
    Container.get<Car>(Car).engine.serialNumber.should.be.equal("A-123");
  });

  it("should support factory classes", () => {
    @Service()
    class Engine {
      public serialNumber = "A-123";
    }

    @Service()
    class CarFactory {
      constructor (public engine: Engine) {}

      createCar () {
        return new Car("BMW", this.engine);
      }
    }

    @Service({ factory: [CarFactory, "createCar"] })
    class Car {
      name: string;

      constructor (name: string, public engine: Engine) {
        this.name = name;
      }
    }

    Container.get<Car>(Car).name.should.be.equal("BMW");
    Container.get<Car>(Car).engine.serialNumber.should.be.equal("A-123");
  });

  it("should support factory function with arguments", () => {
    @Service()
    class Engine {
      public type = "V8";
    }

    @Service()
    class Wheel {
      count = 4;
    }

    @Service()
    class CarFactory {
      createCar (engine: Engine, wheel: Wheel) {
        engine.type = "V6";
        return new Car(engine, wheel);
      }
    }

    @Service({ factory: [CarFactory, "createCar"] })
    class Car {
      constructor (public engine: Engine, public wheel: Wheel) {}
    }

    Container.get<Car>(Car).engine.type.should.be.equal("V6");
    Container.get<Car>(Car).wheel.count.should.be.equal(4);
  });

  it("should throw Error: factory function with arguments (service not found)", () => {
    // @Service()
    class Engine2 {
      public type = "V8";
    }

    @Service({ factory: () => new Wheel2(3) })
    class Wheel2 {
      count = 4;

      constructor (count: number) {
        this.count = count;
      }
    }

    // @Service()
    class CarFactory {
      createCar (engine: Engine2, wheel: Wheel2) {
        engine.type = "V6";
        return new Car(engine, wheel);
      }
    }

    @Service({ factory: [CarFactory, "createCar"] })
    class Car {
      constructor (public engine: Engine2, public wheel: Wheel2) {}
    }

    Container.get<Car>(Car).engine.type.should.be.equal("V6");
    Container.get<Car>(Car).wheel.count.should.be.equal(3);
  });

  it("should support transient services", () => {
    @Service()
    class Car {
      public serial = Math.random();
    }

    @Service({ transient: true })
    class Engine {
      public serial = Math.random();
    }

    const car1Serial = Container.get<Car>(Car).serial;
    const car2Serial = Container.get<Car>(Car).serial;
    const car3Serial = Container.get<Car>(Car).serial;

    const engine1Serial = Container.get<Engine>(Engine).serial;
    const engine2Serial = Container.get<Engine>(Engine).serial;
    const engine3Serial = Container.get<Engine>(Engine).serial;

    car1Serial.should.be.equal(car2Serial);
    car1Serial.should.be.equal(car3Serial);

    engine1Serial.should.not.be.equal(engine2Serial);
    engine2Serial.should.not.be.equal(engine3Serial);
    engine3Serial.should.not.be.equal(engine1Serial);
  });

  it("should support global services", () => {
    @Service()
    class Engine {
      public name = "sporty";
    }

    @Service({ global: true })
    class Car {
      public name = "SportCar";
    }

    const globalContainer = Container;
    const scopedContainer = Container.of("enigma");

    globalContainer.get<Car>(Car).name.should.be.equal("SportCar");
    scopedContainer.get<Car>(Car).name.should.be.equal("SportCar");

    globalContainer.get<Engine>(Engine).name.should.be.equal("sporty");
    scopedContainer.get<Engine>(Engine).name.should.be.equal("sporty");

    globalContainer.get<Car>(Car).name = "MyCar";
    globalContainer.get<Engine>(Engine).name = "regular";

    globalContainer.get<Car>(Car).name.should.be.equal("MyCar");
    scopedContainer.get<Car>(Car).name.should.be.equal("MyCar");

    globalContainer.get<Engine>(Engine).name.should.be.equal("regular");
    scopedContainer.get<Engine>(Engine).name.should.be.equal("sporty");
  });
});
