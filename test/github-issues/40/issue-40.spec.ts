import "reflect-metadata";

import chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service, Inject } from "../../../src";

chai.should();
chai.use(sinon_chai);
const expect = chai.expect;

describe("github issues > #40 Constructor inject not working", function () {
  beforeEach(() => Container.reset());

  it("should work properly", function () {
    @Service("AccessTokenService")
    class AccessTokenService {
      constructor (
        @Inject("moment") public moment: any,
        @Inject("jsonwebtoken") public jsonwebtoken: any,
        @Inject("cfg.auth.jwt") public jwt: any,
      ) {}
    }

    Container.set("moment", "A");
    Container.set("jsonwebtoken", "B");
    Container.set("cfg.auth.jwt", "C");
    const accessTokenService = Container.get<AccessTokenService>("AccessTokenService");

    expect(accessTokenService.moment).not.to.be.undefined;
    expect(accessTokenService.jsonwebtoken).not.to.be.undefined;
    expect(accessTokenService.jwt).not.to.be.undefined;

    accessTokenService.moment.should.be.equal("A");
    accessTokenService.jsonwebtoken.should.be.equal("B");
    accessTokenService.jwt.should.be.equal("C");
  });
});
