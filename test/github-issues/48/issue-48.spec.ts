import "reflect-metadata";

import chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service, Token } from "../../../src";

chai.should();
chai.use(sinon_chai);

describe("github issues > #48 Token service iDs in global container aren't inherited by scoped containers", () => {
  beforeEach(() => Container.reset());

  it("should work properly", () => {
    let poloCounter = 0;

    interface FooService {
      marco (): void;
    }

    const FooServiceToken = new Token<FooService>();

    // @Service({ id: FooServiceToken, factory: () => new FooServiceI() }) <= Providing a factory does not work either
    @Service(FooServiceToken)
    class FooServiceI implements FooService {
      public marco () {
        poloCounter++;
      }
    }

    Container.get(FooServiceToken).marco();
    const scopedContainer = Container.of({});
    scopedContainer.get<FooServiceI>(FooServiceI).marco();
    scopedContainer.get(FooServiceToken).marco();
    poloCounter.should.be.equal(3);
  });
});
