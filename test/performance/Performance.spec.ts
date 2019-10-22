/* tslint:disable:max-classes-per-file */
import "reflect-metadata";

import * as chai from "chai";
import sinon_chai from "sinon-chai";

import { Container, Service } from "../../src";
import { ContainerMock } from "./ContainerMock";
import { useTimerify } from "./PerfHooks";

chai.should();
chai.use(sinon_chai);
const expect = chai.expect;

describe("Performance", () => {
  beforeEach(() => Container.reset());

  describe("registerHandler", () => {
    it("should have ability to pre-specify class initialization parameters (normal case)", () => {
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

      const [ getServices, getServicesTimer ] = useTimerify(() => {
        Container.get<ExtraService>(ExtraService).luckyNumber.should.be.equal(777);
        Container.get<ExtraService>(ExtraService).message.should.be.equal("hello parameter");
      });

      getServices();
      getServicesTimer.then(({ duration }) => duration.should.be.lessThan(3));
    });

    it("should be able to manage a lot of Handlers (1000000 Handlers)", async () => {
      @Service()
      class ExtraService {
        constructor (public luckyNumber: number, public message: string) {}
      }

      const [ setAll, setAllTimer ] = useTimerify(() =>
        Array.from(Array(1000000)).map((val, index) => Container.registerHandler({
          index,
          object: `test${index}-service`,
          value: (containerInstance) => index,
        })),
      );

      setAll();
      setAllTimer.then(({ duration }) => console.log(duration));
      const { duration: setAllDuration } = await setAllTimer;
      setAllDuration.should.be.lessThan(1500);

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

      const [ getServices, getServicesTimer ] = useTimerify(() => {
        Container.get<ExtraService>(ExtraService).luckyNumber.should.be.equal(777);
        Container.get<ExtraService>(ExtraService).message.should.be.equal("hello parameter");
      });

      getServices();
      getServicesTimer.then(({ duration }) => console.log(duration));
      const { duration: getServicesDuration } = await getServicesTimer;
      getServicesDuration.should.be.lessThan(4);
    });
  });

  describe("set", () => {

    it("should be able to manage a lot of services (proof of concept)", async () => {
      class TestService {}

      const testService = new TestService();
      const test1Service = new TestService();

      const [ setAll, setAllTimer ] = useTimerify(() =>
        Array.from(Array(10000)).map((val, index) => ContainerMock.set({
          id: `test${index}-service`,
          value: test1Service,
        })),
      );

      setAll();

      ContainerMock.set([
        { id: TestService, value: testService },
      ]);

      const [ getServices, getServicesTimer ] = useTimerify(() => {
        ContainerMock.get(TestService).should.be.equal(testService);
        ContainerMock.get<TestService>("test999-service").should.be.equal(test1Service);
      });

      getServices();

      const setAllTimerEntry = await setAllTimer;
      const getServicesTimerEntry = await getServicesTimer;

      setAllTimerEntry.duration.should.be.lessThan(60);
      getServicesTimerEntry.duration.should.be.lessThan(4);
    });

    it("should be able to manage a lot of services (10000 services)", async () => {
      class TestService {}

      const testService = new TestService();
      const test1Service = new TestService();

      const [ setAll, setAllTimer ] = useTimerify(() =>
        Array.from(Array(10000)).map((val, index) => Container.set({
          id: `test${index}-service`,
          value: test1Service,
        })),
      );

      setAll();

      Container.set([
        { id: TestService, value: testService },
      ]);

      const [ getServices, getServicesTimer ] = useTimerify(() => {
        Container.get(TestService).should.be.equal(testService);
        Container.get<TestService>("test999-service").should.be.equal(test1Service);
      });

      getServices();

      const setAllTimerEntry = await setAllTimer;
      const getServicesTimerEntry = await getServicesTimer;

      setAllTimerEntry.duration.should.be.lessThan(60);
      getServicesTimerEntry.duration.should.be.lessThan(4);
    });
  });
});
