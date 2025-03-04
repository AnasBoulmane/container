import { Container } from "../Container";
import { ContainerInstance } from "../ContainerInstance";
import { Token } from "../Token";
import { ServiceMetadata } from "..";
import { ServiceOptions } from "..";

export type ObjectType<T1> = (new (...args: any[]) => T1) | { service: T1 };

/**
 * Marks class as a service that can be injected using container.
 */
export function Service<T, K extends keyof T> (
  optionsOrServiceName?: ServiceOptions<T, K> | Token<any> | string | any[] | (() => any),
  maybeFactory?: (...args: any[]) => any,
): any {
  if (arguments.length === 2 || optionsOrServiceName instanceof Function) {
    console.log("debug", { optionsOrServiceName, maybeFactory });
    const serviceId = { service: new Token<T>() };
    const dependencies = arguments.length === 2 ? (optionsOrServiceName as any[]) : [];
    const factory = arguments.length === 2 ? maybeFactory : (optionsOrServiceName as (...args: any[]) => any);

    Container.set({
      id: serviceId.service,
      factory: (container: ContainerInstance) => {
        const params = dependencies.map((dependency) => container.get(dependency));
        return factory(...params);
      },
    });

    return serviceId;
  } else {
    return (target: (...args: any[]) => any) => {
      const service: ServiceMetadata<T, K> = {
        type: target,
      };

      if (typeof optionsOrServiceName === "string" || optionsOrServiceName instanceof Token) {
        service.id = optionsOrServiceName;
        service.multiple = (optionsOrServiceName as ServiceOptions<T, K>).multiple;
        service.global = (optionsOrServiceName as ServiceOptions<T, K>).global || false;
        service.transient = (optionsOrServiceName as ServiceOptions<T, K>).transient;
      } else if (optionsOrServiceName) {
        // ServiceOptions
        service.id = (optionsOrServiceName as ServiceOptions<T, K>).id;
        service.factory = (optionsOrServiceName as ServiceOptions<T, K>).factory;
        service.multiple = (optionsOrServiceName as ServiceOptions<T, K>).multiple;
        service.global = (optionsOrServiceName as ServiceOptions<T, K>).global || false;
        service.transient = (optionsOrServiceName as ServiceOptions<T, K>).transient;
      }

      Container.set(service);
    };
  }
}
