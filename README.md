# @express.ts/container

[![Build Status](https://travis-ci.org/express-ts/container.svg?branch=master)](https://travis-ci.org/express-ts/container)
[![npm version](https://badge.fury.io/js/typedi.svg)](https://badge.fury.io/js/typedi)
[![Dependency Status](https://david-dm.org/express-ts/container.svg)](https://david-dm.org/express-ts/container)
[![DevDependency Status](https://david-dm.org/express-ts/container/dev-status.svg)](https://david-dm.org/express-ts/container?type=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/57d40983bb0e4c5aace3/maintainability)](https://codeclimate.com/github/AnasBoulmane/container/maintainability)
[![Coverage Status](https://coveralls.io/repos/github/express-ts/container/badge.svg?branch=master)](https://coveralls.io/github/express-ts/container?branch=master)
[![Join the chat at https://gitter.im/typestack/typedi](https://badges.gitter.im/typestack/typedi.svg)](https://gitter.im/typestack/typedi?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

@express.ts/container is a [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) tool for JavaScript
and TypeScript. It is a process whereby objects define their dependencies (that is, the other objects they work with) only
through constructor arguments, arguments to a factory method, or properties that are set on the object instance after it
is constructed or returned from a factory method. The container then injects those dependencies when it creates the bean.
This process is fundamentally the inverse (hence the name, Inversion of Control) of the bean itself controlling the
instantiation or location of its dependencies by using direct construction of classes or a mechanism such as the Service
Locator pattern.

Using @express.ts/container you can build well-structured and easily tested applications.

## Usage with JavaScript

Install the module:

`npm install @express.ts/container --save`

Now you can use @express.ts/container [with JavaScript](https://github.com/typestack/typedi#usage-with-javascript).

## Usage with TypeScript

1. Install module:

    `npm install @express.ts/container --save`

2. Install [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) package:

    `npm install reflect-metadata --save`

    and import it somewhere in the global place of your app before any service declaration or import (for example in `app.ts`):

    `import "reflect-metadata";`

3. You may need to install node typings:

    `npm install @types/node --save-dev`


4. Enabled following settings in `tsconfig.json`:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

Now you can use @express.ts/container [with TypeScript](https://github.com/typestack/typedi#usage-with-typeScript).


## TypeScript Advanced Usage Examples

* [Services with token name](https://github.com/typestack/typedi#services-with-token-name)
* [Using factory function to create service](https://github.com/typestack/typedi#using-factory-function-to-create-service)
* [Using factory class to create service](https://github.com/typestack/typedi#using-factory-class-to-create-service)
* [Problem with circular references](https://github.com/typestack/typedi#problem-with-circular-references)
* [Inherited injections](https://github.com/typestack/typedi#inherited-injections)
* [Custom decorators](https://github.com/typestack/typedi#custom-decorators)
* [Using service groups](https://github.com/typestack/typedi#using-service-groups)
* [Using multiple containers and scoped containers](https://github.com/typestack/typedi#using-multiple-containers-and-scoped-containers)
* [Remove registered services or reset container state](https://github.com/typestack/typedi#remove-registered-services-or-reset-container-state)

## Samples

Take a look on samples in [./sample](https://github.com/pleerock/@express.ts/container/tree/master/sample) for examples of usage.
