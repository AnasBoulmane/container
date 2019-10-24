import { ContainerInstance } from "./ContainerInstance";
import { Token } from "./Token";
import { Handler } from "./types/Handler";
import { ServiceIdentifier } from "./types/ServiceIdentifier";
import { ServiceMetadata } from "./types/ServiceMetadata";

/**
 * Service container.
 */
export class Container {
  // -------------------------------------------------------------------------
  // Private Static Properties
  // -------------------------------------------------------------------------

  /**
   * Global container instance.
   */
  public static readonly globalInstance: ContainerInstance = new ContainerInstance(undefined);

  /**
   * Other containers created using Container.of method.
   */
  public static readonly instances: ContainerInstance[] = [];

  /**
   * All registered handlers.
   */
  static readonly handlers: Map<any, Handler[]> = new Map<any, Handler[]>();

  // -------------------------------------------------------------------------
  // Public Static Methods
  // -------------------------------------------------------------------------

  /**
   * Gets a separate container instance for the given instance id.
   */
  static of (instanceId: any): ContainerInstance {
    if (instanceId === undefined) {
      return this.globalInstance;
    }

    let container = this.instances.find((instance) => instance.id === instanceId);
    if (!container) {
      container = new ContainerInstance(instanceId);
      this.instances.push(container);
    }

    return container;
  }

  /**
   * Checks if the service with given name or type is registered service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   * has<T> (id: Token<T>): boolean;
   * has<T> (id: string): boolean;
   * has<T> (type: ObjectType<T>): boolean;
   * has<T> (identifier: ServiceIdentifier): boolean;
   */
  static has<T> (identifier: ServiceIdentifier<T>): boolean {
    return this.globalInstance.has(identifier as any);
  }

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   * get<T> (id: string): T;
   * get<T> (id: Token<T>): T;
   * get<T> (service: { service: T }): T;
   * get<T> (identifier: ServiceIdentifier<T>): T;
   */
  static get<T> (identifier: ServiceIdentifier<T>): T {
    return this.globalInstance.get(identifier as any);
  }

  /**
   * Gets all instances registered in the container of the given service identifier.
   * Used when service defined with multiple: true flag.
   */
  static getMany<T> (id: string | Token<T>): T[] {
    return this.globalInstance.getMany(id as any);
  }

  /**
   * Sets a value for the given type or service name in the container.
   * set (type: Function | Token<any> | string, value: any): Container;
   * set<T, K extends keyof T> (service: ServiceMetadata<T, K>): Container;
   * set<T, K extends keyof T> (values: Array<ServiceMetadata<T, K>>): Container;
   */
  static set (
    identifierOrServiceMetadata: ServiceIdentifier | ServiceMetadata<any, any> | (Array<ServiceMetadata<any, any>>),
    value?: any,
  ): Container {
    this.globalInstance.set(identifierOrServiceMetadata as any, value);
    return this;
  }

  /**
   * Removes services with a given service identifiers (tokens or types).
   */
  static remove (...ids: ServiceIdentifier[]): Container {
    this.globalInstance.remove(...ids);
    return this;
  }

  /**
   * Completely resets the container by removing all previously registered services and handlers from it.
   */
  static reset (containerId?: any): Container {
    if (containerId) {
      const instance = this.instances.find((inst) => inst.id === containerId);
      if (instance) {
        instance.reset();
        this.instances.splice(this.instances.indexOf(instance), 1);
      }
    } else {
      this.globalInstance.reset();
      this.instances.forEach((instance) => instance.reset());
    }
    return this;
  }

  /**
   * Registers a new handler.
   */
  static registerHandler (handler: Handler): Container {
    const id = handler.propertyName && typeof handler.object !== "string" && !(handler.object instanceof Token)
      ? handler.object.constructor
      : handler.object;
    const handlers = this.handlers.get(id);
    if (handlers) {
      handlers.push(handler);
    } else {
      this.handlers.set(id, [handler]);
    }
    return this;
  }

  /**
   * Helper method that imports given services.
   */
  static import (services: Function[]): Container {
    return this;
  }
}
