import { Container } from "./Container";
import { MissingProvidedServiceTypeError } from "./error/MissingProvidedServiceTypeError";
import { ServiceNotFoundError } from "./error/ServiceNotFoundError";
import { Token } from "./Token";
import { ServiceIdentifier } from "./types/ServiceIdentifier";
import { ServiceMetadata } from "./types/ServiceMetadata";

/**
 * TypeDI can have multiple containers.
 * One container is ContainerInstance.
 */
export class ContainerInstance {
  // -------------------------------------------------------------------------
  // Public Properties
  // -------------------------------------------------------------------------

  /**
   * Container instance id.
   */
  id: any;

  // -------------------------------------------------------------------------
  // Private Properties
  // -------------------------------------------------------------------------

  /**
   * All registered services.
   */
  private services: Map<ServiceIdentifier<any>, ServiceMetadata<any, any>> = new Map();
  private groupedServices: Map<ServiceIdentifier<any>, Array<ServiceMetadata<any, any>>> = new Map();

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor (id: any) {
    this.id = id;
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Checks if the service with given name or type is registered service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   *   has<T> (type: ObjectType<T>): boolean;
   *   has<T> (id: string): boolean;
   *   has<T> (id: Token<T>): boolean;
   */
  has<T> (identifier: ServiceIdentifier): boolean {
    return !!this.findService(identifier);
  }

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   *   get<T> (type: ObjectType<T>): T;
   *   get<T> (id: string): T;
   *   get<T> (id: Token<T>): T;
   *   get<T> (id: { service: T }): T;
   */
  get<T> (identifier: ServiceIdentifier<T>): T {
    const globalContainer = Container.of(undefined);
    const service = globalContainer.findService(identifier);
    const scopedService = this.findService(identifier);
    const groupedService = this.groupedServices.get(identifier);

    if (service && service.global === true) {
      return this.getServiceValue(identifier, service);
    }

    if (scopedService) {
      return this.getServiceValue(identifier, scopedService);
    }

    if (service && this !== globalContainer) {
      const clonedService = Object.assign({}, service);
      clonedService.value = undefined;
      const value = this.getServiceValue(identifier, clonedService);
      this.set(identifier, value);
      return value;
    }

    if (groupedService && groupedService.length) {
      return this.getServiceValue(identifier, groupedService[0]);
    }

    return this.getServiceValue(identifier, service);
  }

  /**
   * Gets all instances registered in the container of the given service identifier.
   * Used when service defined with multiple: true flag.
   */
  getMany<T> (id: string | Token<T>): T[] {
    try {
      return this.groupedServices.get(id).map((service) => this.getServiceValue(id, service));
    } catch (e) {
      throw new ServiceNotFoundError(id);
    }
  }

  /**
   * Sets a value for the given type or service name in the container.
   *   set<T, K extends keyof T> (values: Array<ServiceMetadata<T, K>>): this;
   *   set<T, K extends keyof T> (service: ServiceMetadata<T, K>): this;
   *   set (type: Function, value: any): this;
   *   set (name: string, value: any): this;
   *   set (name: string, value: any): this;
   *   set (token: Token<any>, value: any): this;
   *   set (token: ServiceIdentifier, value: any): this;
   */
  set (
    identifierOrServiceMetadata: ServiceIdentifier | ServiceMetadata<any, any> | (Array<ServiceMetadata<any, any>>),
    value?: any,
  ): this {
    let newService: ServiceMetadata<any, any> = identifierOrServiceMetadata as any;
    if (identifierOrServiceMetadata instanceof Array) {
      identifierOrServiceMetadata.forEach((v: any) => this.set(v));
      return this;
    }
    if (typeof identifierOrServiceMetadata === "string" || identifierOrServiceMetadata instanceof Token) {
      newService = { id: identifierOrServiceMetadata, value };
    }
    if (
      typeof identifierOrServiceMetadata === "object" &&
      (identifierOrServiceMetadata as { service: Token<any> }).service
    ) {
      newService = { id: (identifierOrServiceMetadata as { service: Token<any> }).service, value };
    }
    if (identifierOrServiceMetadata instanceof Function) {
      newService = { type: identifierOrServiceMetadata, id: identifierOrServiceMetadata, value };
    }
    if (
      typeof identifierOrServiceMetadata === "object" &&
      (identifierOrServiceMetadata as { type: any }).type &&
      !(identifierOrServiceMetadata as { id: any }).id
    ) {
      const { type } = identifierOrServiceMetadata as any;
      newService = { ...identifierOrServiceMetadata, id: type, value };
    }

    if (newService.multiple === true) {
      const otherServices = this.groupedServices.get(newService.id) || [];
      this.groupedServices.set(newService.id, [...otherServices, newService]);
    } else {
      const service = this.findService(newService.id);
      if (service && service.multiple !== true) {
        Object.assign(service, newService);
      } else {
        this.services.set(newService.id, newService);
      }
    }

    return this;
  }

  /**
   * Removes services with a given service identifiers (tokens or types).
   */
  remove (...ids: ServiceIdentifier[]): this {
    ids.forEach((id) => this.services.delete(id));
    return this;
  }

  /**
   * Completely resets the container by removing all previously registered services from it.
   */
  reset (): this {
    this.services.clear();
    return this;
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  /**
   * Filters registered service in the with a given service identifier.
   */
  private filterServices (identifier: ServiceIdentifier): Array<ServiceMetadata<any, any>> {
    return (this.services.get(identifier) as any) as Array<ServiceMetadata<any, any>>;
  }

  /**
   * Finds registered service in the with a given service identifier.
   */
  private findService (identifier: ServiceIdentifier): ServiceMetadata<any, any> | undefined {
    const id = (identifier as any).service instanceof Token ? (identifier as any).service : identifier;
    return this.services.get(id);
  }

  /**
   * Gets service value.
   */
  private getServiceValue (identifier: ServiceIdentifier, service: ServiceMetadata<any, any> | undefined): any {
    // find if instance of this object already initialized in the container and return it if it is
    if (service && service.value !== undefined) {
      return service.value;
    }

    // if named service was requested and its instance was not found plus there is not type to know what to initialize,
    // this means service was not pre-registered and we throw an exception
    if (
      (!service || !service.type) &&
      (!service || !service.factory) &&
      (typeof identifier === "string" || identifier instanceof Token)
    ) {
      throw new ServiceNotFoundError(identifier);
    }

    // at this point we either have type in service registered, either identifier is a target type
    let type;
    if (service && service.type) {
      type = service.type;
    } else if (service && service.id instanceof Function) {
      type = service.id;
    } else if (identifier instanceof Function) {
      type = identifier;

      // } else if (identifier instanceof Object && (identifier as { service: Token<any> }).service instanceof Token) {
      //     type = (identifier as { service: Token<any> }).service;
    }

    // if service was not found then create a new one and register it
    if (!service) {
      if (!type) {
        throw new MissingProvidedServiceTypeError(identifier);
      }

      service = { type, id: type };
      this.services.set(service.id, service);
    }

    // setup constructor parameters for a newly initialized service
    const paramTypes =
      type && Reflect && (Reflect as any).getMetadata
        ? (Reflect as any).getMetadata("design:paramtypes", type)
        : undefined;
    let params: any[] = paramTypes ? this.initializeParams(type, paramTypes) : [];

    // if factory is set then use it to create service instance
    let value: any;
    if (service.factory) {
      // filter out non-service parameters from created service constructor
      // non-service parameters can be, lets say Car(name: string, isNew: boolean, engine: Engine)
      // where name and isNew are non-service parameters and engine is a service parameter
      params = params.filter((param) => param !== undefined);

      if (service.factory instanceof Array) {
        // use special [Type, "create"] syntax to allow factory services
        // in this case Type instance will be obtained from Container and its method "create" will be called
        value = (this.get(service.factory[0]) as any)[service.factory[1]](...params);
      } else {
        // regular factory function
        value = service.factory(...params, this);
      }
    } else {
      // otherwise simply create a new object instance
      if (!type) {
        throw new MissingProvidedServiceTypeError(identifier);
      }

      params.unshift(undefined);

      // "extra feature" - always pass container instance as the last argument to the service function
      // this allows us to support javascript where we don't have decorators and emitted metadata about dependencies
      // need to be injected, and user can use provided container to get instances he needs
      params.push(this);

      value = new (type.bind.apply(type, params))();
    }

    if (service && !service.transient && value) {
      service.value = value;
    }

    if (type) {
      this.applyPropertyHandlers(type, value);
    }

    return value;
  }

  /**
   * Initializes all parameter types for a given target service class.
   */
  private initializeParams (type: Function, paramTypes: any[]): any[] {
    return paramTypes.map((paramType, index) => {
      const paramHandler = (Container.handlers.get(type) || []).find((handler) => handler.index === index);
      if (paramHandler) {
        return paramHandler.value(this);
      }

      if (paramType && paramType.name && !this.isTypePrimitive(paramType.name)) {
        return this.get(paramType);
      }

      return undefined;
    });
  }

  /**
   * Checks if given type is primitive (e.g. string, boolean, number, object).
   */
  private isTypePrimitive (param: string): boolean {
    return ["string", "boolean", "number", "object"].indexOf(param.toLowerCase()) !== -1;
  }

  /**
   * Applies all registered handlers on a given target class.
   */
  private applyPropertyHandlers (target: Function, instance: { [key: string]: any }) {
    (Container.handlers.get(target) || []).forEach((handler) => {
      instance[handler.propertyName] = handler.value(this);
    });
  }
}
