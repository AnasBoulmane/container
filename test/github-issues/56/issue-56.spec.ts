/* tslint:disable:max-classes-per-file */
/* tslint:disable:no-unused-expression */
import "reflect-metadata";

import chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service } from "../../../src";

chai.should();
chai.use(sinon_chai);
const expect = chai.expect;

describe("github issues > #56 extended class is being overwritten", () => {
  beforeEach(() => Container.reset());

  it("should work properly", () => {
    @Service()
    class Rule {
      getRule () {
        return "very strict rule";
      }
    }

    @Service()
    class Whitelist extends Rule {
      getWhitelist () {
        return ["rule1", "rule2"];
      }
    }

    const whitelist = Container.get<Whitelist>(Whitelist);
    expect(whitelist.getRule).to.not.be.undefined;
    expect(whitelist.getWhitelist).to.not.be.undefined;
    whitelist.getWhitelist().should.be.eql(["rule1", "rule2"]);
    whitelist.getRule().should.be.equal("very strict rule");

    const rule = Container.get<Rule>(Rule);
    expect(rule.getRule).to.not.be.undefined;
    expect((rule as Whitelist).getWhitelist).to.be.undefined;
    rule.getRule().should.be.equal("very strict rule");
  });
});
