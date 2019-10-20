import "reflect-metadata";

import chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service, Token } from "../../../src";

chai.should();
chai.use(sinon_chai);

describe("github issues > #41 Token as service id in combination with factory", function () {
  beforeEach(() => Container.reset());

  it("should work properly", function () {
    interface SomeInterface {
      foo (): string;
    }

    const SomeInterfaceToken = new Token<SomeInterface>();

    @Service()
    class SomeInterfaceFactory {
      create () {
        return new SomeImplementation();
      }
    }

    @Service({
      id: SomeInterfaceToken,
      factory: [SomeInterfaceFactory, "create"],
    })
    class SomeImplementation implements SomeInterface {
      foo () {
        return "hello implementation";
      }
    }

    Container.set("moment", "A");
    Container.set("jsonwebtoken", "B");
    Container.set("cfg.auth.jwt", "C");
    const someInterfaceImpl = Container.get(SomeInterfaceToken);
    someInterfaceImpl.foo().should.be.equal("hello implementation");
  });
});
