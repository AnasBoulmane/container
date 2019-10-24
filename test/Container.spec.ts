/* tslint:disable:max-classes-per-file */
import "reflect-metadata";

import * as chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service, Token } from "../src";
import { ServiceNotFoundError } from "../src/error/ServiceNotFoundError";
import { MissingProvidedServiceTypeError } from "../src/error/MissingProvidedServiceTypeError";

chai.should();
chai.use(sinon_chai);
const expect = chai.expect;

describe("Container", () => {
  beforeEach(() => Container.reset());

  describe("get", () => {
    it("should be able to get a boolean", () => {
      const booleanTrue = "boolean.true";
      const booleanFalse = "boolean.false";
      Container.set(booleanTrue, true);
      Container.set(booleanFalse, false);

      Container.get(booleanTrue).should.be.eq(true);
      Container.get(booleanFalse).should.be.eq(false);
    });

    it("should be able to get an empty string", () => {
      const emptyString = "emptyString";
      Container.set(emptyString, "");

      Container.get(emptyString).should.be.eq("");
    });

    it("should be able to get the 0 number", () => {
      const zero = "zero";
      Container.set(zero, 0);

      Container.get(zero).should.be.eq(0);
    });
  });

  describe("set", () => {
    it("should be able to set a class into the container", () => {
      class TestService {
        constructor (public name: string) {}
      }
      const testService = new TestService("this is test");
      Container.set(TestService, testService);
      Container.get(TestService).should.be.equal(testService);
      Container.get<TestService>(TestService).name.should.be.equal("this is test");
    });

    it("should be able to set a named service", () => {
      class TestService {
        constructor (public name: string) {}
      }
      const firstService = new TestService("first");
      Container.set("first.service", firstService);

      const secondService = new TestService("second");
      Container.set("second.service", secondService);

      Container.get<TestService>("first.service").name.should.be.equal("first");
      Container.get<TestService>("second.service").name.should.be.equal("second");
    });

    it("should be able to set a tokenized service", () => {
      class TestService {
        constructor (public name: string) {}
      }
      const FirstTestToken = new Token<TestService>();
      const SecondTestToken = new Token<TestService>();

      const firstService = new TestService("first");
      Container.set(FirstTestToken, firstService);

      const secondService = new TestService("second");
      Container.set(SecondTestToken, secondService);

      Container.get(FirstTestToken).name.should.be.equal("first");
      Container.get(SecondTestToken).name.should.be.equal("second");
    });

    it("should be able to set a service like { service: T }", () => {
      class TestService {
        constructor (public name: string) {}
      }
      const FirstTestToken = new Token<TestService>();

      const firstService = new TestService("first");
      Container.set({ service: FirstTestToken }, firstService);

      const secondService = new TestService("second");
      Container.set({ service: TestService }, secondService);

      Container.get({ service: FirstTestToken }).name.should.be.equal("first");

      expect(() => Container.get({ service: TestService })).to.throw(MissingProvidedServiceTypeError);
    });

    it("should override previous value if service is written second time", () => {
      class TestService {
        constructor (public name: string) {}
      }
      const TestToken = new Token<TestService>();

      const firstService = new TestService("first");
      Container.set(TestToken, firstService);
      Container.get(TestToken).should.be.equal(firstService);
      Container.get(TestToken).name.should.be.equal("first");

      const secondService = new TestService("second");
      Container.set(TestToken, secondService);

      Container.get(TestToken).should.be.equal(secondService);
      Container.get(TestToken).name.should.be.equal("second");
    });
  });

  describe("set multiple", () => {
    it("should be able to provide a list of values", () => {
      class TestService {}

      class TestServiceFactory {
        create () {
          return "test3-service-created-by-factory";
        }
      }

      const testService = new TestService();
      const test1Service = new TestService();
      const test2Service = new TestService();

      Container.set([
        { id: TestService, value: testService },
        { id: "test1-service", value: test1Service },
        { id: "test2-service", value: test2Service },
        { id: "test3-service", factory: [TestServiceFactory, "create"] },
      ]);

      Container.get(TestService).should.be.equal(testService);
      Container.get<TestService>("test1-service").should.be.equal(test1Service);
      Container.get<TestService>("test2-service").should.be.equal(test2Service);
      Container.get<string>("test3-service").should.be.equal("test3-service-created-by-factory");
    });
  });

  describe("remove", () => {
    it("should be able to remove previously registered services", () => {
      class TestService {}

      const testService = new TestService();
      const test1Service = new TestService();
      const test2Service = new TestService();

      Container.set([
        { id: TestService, value: testService },
        { id: "test1-service", value: test1Service },
        { id: "test2-service", value: test2Service },
      ]);

      Container.get(TestService).should.be.equal(testService);
      Container.get<TestService>("test1-service").should.be.equal(test1Service);
      Container.get<TestService>("test2-service").should.be.equal(test2Service);

      Container.remove("test1-service", "test2-service");

      Container.get(TestService).should.be.equal(testService);
      expect(() => Container.get<TestService>("test1-service")).to.throw(ServiceNotFoundError);
      expect(() => Container.get<TestService>("test2-service")).to.throw(ServiceNotFoundError);
    });
  });

  describe("reset", () => {
    it("should support container reset", () => {
      @Service()
      class TestService {
        constructor (public name: string = "frank") {}
      }

      const testService = new TestService("john");
      Container.set(TestService, testService);
      Container.get(TestService).should.be.equal(testService);
      Container.get<TestService>(TestService).name.should.be.equal("john");
      Container.reset();
      Container.get(TestService).should.not.be.equal(testService);
      Container.get<TestService>(TestService).name.should.be.equal("frank");
    });
  });

  describe("registerHandler", () => {
    it("should have ability to pre-specify class initialization parameters", () => {
      @Service()
      class ExtraService {
        constructor (public luckyNumber: number, public message: string) {}
      }

      Container.registerHandler({
        object: ExtraService,
        index: 0,
        value: (containerInstance) => 777,
      });

      Container.registerHandler({
        object: ExtraService,
        index: 1,
        value: (containerInstance) => "hello parameter",
      });

      Container.get<ExtraService>(ExtraService).luckyNumber.should.be.equal(777);
      Container.get<ExtraService>(ExtraService).message.should.be.equal("hello parameter");
    });

    it("should have ability to pre-specify initialized class properties", () => {
      function CustomInject (value: any) {
        return (target: any, propertyName: string) => {
          Container.registerHandler({
            object: target,
            propertyName,
            value: (containerInstance) => value,
          });
        };
      }

      @Service()
      class ExtraService {
        @CustomInject(888)
        badNumber: number;

        @CustomInject("bye world")
        byeMessage: string;
      }

      Container.get<ExtraService>(ExtraService).badNumber.should.be.equal(888);
      Container.get<ExtraService>(ExtraService).byeMessage.should.be.equal("bye world");
    });
  });

  describe("multiple container", () => {
    it("should have ability to pre-specify class initialization parameters", () => {
      @Service()
      class QuestionRepository {
        userName: string;

        save () {
          console.log(`saving question. author is ${this.userName}`);
        }
      }

      @Service()
      class QuestionController {
        constructor (public questionRepository: QuestionRepository) {}

        save (name: string) {
          if (name) {
            this.questionRepository.userName = name;
          }
          this.questionRepository.save();
        }
      }

      const request1 = { param: "Timber" };
      const instances1 = Container.of(request1);
      const controller1A = instances1.get<QuestionController>(QuestionController);
      const controller1B = instances1.get<QuestionController>(QuestionController);
      controller1A.should.be.eq(controller1B);
      controller1A.save("Timber");
      controller1B.questionRepository.userName.should.be.equal("Timber");
      Container.reset(request1);

      const request2 = { param: "Guest" };
      const instances2 = Container.of(request2);
      const controller2A = instances2.get<QuestionController>(QuestionController);
      const controller2B = instances2.get<QuestionController>(QuestionController);
      controller2A.save("Fool");
      controller2A.should.be.eq(controller2B);
      Container.reset(request2);

      controller1A.should.not.be.equal(controller2A);
      controller2B.questionRepository.userName.should.be.equal("Fool");
    });
  });

  describe("set with ServiceMetadata passed", () => {
    it("should support factory functions", () => {
      class Engine {
        public serialNumber = "A-123";
      }

      class Car {
        constructor (public engine: Engine) {}
      }

      Container.set({
        id: Car,
        factory: () => new Car(new Engine()),
      });

      Container.get<Car>(Car).engine.serialNumber.should.be.equal("A-123");
    });

    it("should support factory classes", () => {
      @Service()
      class Engine {
        public serialNumber = "A-123";
      }

      class Car {
        constructor (public engine: Engine) {}
      }

      @Service()
      class CarFactory {
        constructor (private engine: Engine) {}

        createCar (): Car {
          return new Car(this.engine);
        }
      }

      Container.set({
        id: Car,
        factory: [CarFactory, "createCar"],
      });

      Container.get<Car>(Car).engine.serialNumber.should.be.equal("A-123");
    });

    it("should support tokenized services from factories", () => {
      interface Vehicle {
        getColor (): string;
      }

      class Bus implements Vehicle {
        getColor (): string {
          return "yellow";
        }
      }

      class VehicleFactory {
        createBus (): Vehicle {
          return new Bus();
        }
      }

      const VehicleService = new Token<Vehicle>();

      Container.set({
        id: VehicleService,
        factory: [VehicleFactory, "createBus"],
      });

      Container.get<Vehicle>(VehicleService)
        .getColor()
        .should.be.equal("yellow");
    });
  });
});
