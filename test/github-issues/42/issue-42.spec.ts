import "reflect-metadata";

import chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service, Inject } from "../../../src";

chai.should();
chai.use(sinon_chai);
const expect = chai.expect;

describe("github issues > #42 Exception not thrown on missing binding", function () {
  beforeEach(() => Container.reset());

  it("should work properly", function () {
    interface Factory {
      create (): void;
    }

    @Service()
    class CoffeeMaker {
      @Inject() // This is an incorrect usage of typedi because Factory is an interface
      private factory: Factory;

      make () {
        this.factory.create();
      }
    }

    expect(() => {
      Container.get(CoffeeMaker);
    }).to.throw(Error);
  });
});
