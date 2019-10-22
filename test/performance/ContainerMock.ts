import { Container, ServiceIdentifier, ServiceMetadata, Token } from "../../src";
import { Function } from "@babel/types";

type IdentifierOrServiceMetadata = ServiceIdentifier | ServiceMetadata<any, any> | (Array<ServiceMetadata<any, any>>);

export class ContainerMock {
  static serviceMap  = new Map();
  static set (
    identifierOrServiceMetadata: IdentifierOrServiceMetadata,
    value?: any,
  ): any {
    if (identifierOrServiceMetadata instanceof Array) {
      identifierOrServiceMetadata.forEach((v: any) => this.set(v));
      return this;
    }
    if (typeof identifierOrServiceMetadata === "string" || identifierOrServiceMetadata instanceof Token) {
      return this.set({ id: identifierOrServiceMetadata, value });
    }
    if (
      typeof identifierOrServiceMetadata === "object" &&
      (identifierOrServiceMetadata as { service: Token<any> }).service
    ) {
      return this.set({ id: (identifierOrServiceMetadata as { service: Token<any> }).service, value });
    }
    if (identifierOrServiceMetadata instanceof Function) {
      return this.set({ type: identifierOrServiceMetadata, id: identifierOrServiceMetadata, value });
    }

    // const newService: ServiceMetadata<any, any> = arguments.length === 1 &&
    //   typeof identifierOrServiceMetadata === "object"  &&
    //   !(identifierOrServiceMetadata instanceof Token) ? identifierOrServiceMetadata : undefined;
    const newService: ServiceMetadata<any, any> = identifierOrServiceMetadata as any;
    const service = this.serviceMap.get(newService.id);
    if (service && service.multiple !== true) {
      Object.assign(service, newService);
    } else {
      this.serviceMap.set(newService.id, newService);
    }
  }

  static get<T> (identifier: ServiceIdentifier<T>): T {
    const service = this.serviceMap.get(identifier);
    return service.value || service;
  }
}
