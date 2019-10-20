/* tslint:disable:max-classes-per-file */
/* tslint:disable:no-unused-expression */
import "reflect-metadata";
import chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service, Token, Inject, InjectMany } from "../../src";

chai.should();
chai.use(sinon_chai);

describe("Inject Decorator", () => {
  beforeEach(() => Container.reset());

  it("should inject service into class property", () => {
    @Service()
    class TestService {}
    @Service()
    class SecondTestService {
      @Inject()
      testService: TestService;
    }
    Container.get<SecondTestService>(SecondTestService).testService.should.be.instanceOf(TestService);
  });

  it("should inject token service properly", () => {
    interface Test {
      field?: any;
    }
    const ServiceToken = new Token<Test>();

    @Service(ServiceToken)
    class TestService {}

    @Service()
    class SecondTestService {
      @Inject(ServiceToken)
      testService: Test;
    }
    Container.get<SecondTestService>(SecondTestService).testService.should.be.instanceOf(TestService);
  });

  it("should inject named service into class property", () => {
    @Service("mega.service")
    class NamedService {}
    @Service()
    class SecondTestService {
      @Inject("mega.service")
      megaService: any;
    }
    Container.get<SecondTestService>(SecondTestService).megaService.should.be.instanceOf(NamedService);
  });

  it("should inject service via constructor", () => {
    @Service()
    class TestService {}
    @Service()
    class SecondTestService {}
    @Service("mega.service")
    class NamedService {}
    @Service()
    class TestServiceWithParameters {
      constructor (
        public testClass: TestService,
        @Inject((type) => SecondTestService) public secondTest: any,
        @Inject("mega.service") public megaService: any,
      ) {}
    }
    Container.get<TestServiceWithParameters>(TestServiceWithParameters).testClass.should.be.instanceOf(TestService);
    Container.get<any>(TestServiceWithParameters).secondTest.should.be.instanceOf(SecondTestService);
    Container.get<any>(TestServiceWithParameters).megaService.should.be.instanceOf(NamedService);
  });

  it("should inject service should work with 'many' instances", () => {
    interface Car {
      name: string;
    }
    @Service({ id: "cars", multiple: true })
    class Bmw implements Car {
      name = "BMW";
    }
    @Service({ id: "cars", multiple: true })
    class Mercedes implements Car {
      name = "Mercedes";
    }
    @Service({ id: "cars", multiple: true })
    class Toyota implements Car {
      name = "Toyota";
    }
    @Service()
    class TestServiceWithParameters {
      constructor (@InjectMany("cars") public cars: Car[]) {}
    }

    Container.get<any>(TestServiceWithParameters).cars.length.should.be.equal(3);

    const carNames = Container.get<any>(TestServiceWithParameters).cars.map((car: Car) => car.name);
    carNames.should.contain("BMW");
    carNames.should.contain("Mercedes");
    carNames.should.contain("Toyota");
  });
});
