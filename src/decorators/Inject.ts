import { Container } from "../Container";
import { Token } from "../Token";
import { CannotInjectError } from "../error/CannotInjectError";

interface InjectOptions {
  injectMany?: boolean;
  typeOrName?: any;
}

type InjectDecorator = (target: any, propertyName: string, index?: number) => void;

const injectFactory = ({ typeOrName, injectMany }: InjectOptions): InjectDecorator => (
  target: any,
  propertyName: string,
  index?: number,
) => {
  if (!typeOrName) {
    typeOrName = () => (Reflect as any).getMetadata("design:type", target, propertyName);
  }

  Container.registerHandler({
    object: target,
    propertyName,
    index,
    value: (containerInstance) => {
      let identifier: any;
      if (typeof typeOrName === "string") {
        identifier = typeOrName;
      } else if (typeOrName instanceof Token) {
        identifier = typeOrName;
      } else {
        identifier = typeOrName();
      }

      if (identifier === Object) {
        throw new CannotInjectError(target, propertyName);
      }

      return injectMany ? containerInstance.getMany<any>(identifier) : containerInstance.get<any>(identifier);
    },
  });
};

/**
 * Injects a service into a class property or constructor parameter.
 *  Inject (type?: (type?: any) => Function): Function;
 *  Inject (serviceName?: string): Function;
 *  Inject (token: Token<any>): Function;
 */
export function Inject (typeOrName?: ((type?: any) => Function) | string | Token<any>): InjectDecorator {
  return injectFactory({ typeOrName });
}

/**
 * Injects a service into a class property or constructor parameter.
 *  InjectMany (type?: (type?: any) => Function): Function;
 *  InjectMany (serviceName?: string): Function;
 *  InjectMany (token: Token<any>): Function;
 */
export function InjectMany (typeOrName?: ((type?: any) => Function) | string | Token<any>): InjectDecorator {
  return injectFactory({ typeOrName, injectMany: true });
}
