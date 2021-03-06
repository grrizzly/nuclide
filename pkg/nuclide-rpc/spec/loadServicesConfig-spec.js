'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import loadServicesConfig from '../lib/loadServicesConfig';
import nuclideUri from '../../nuclide-remote-uri';
import {fixtures} from '../../nuclide-test-helpers';

describe('loadServicesConfig()', () => {
  let configPath: ?string;

  beforeEach(() => {
    waitsForPromise(async () => {
      const services3json = [
        {
          implementation: './FooService.js',
          name: 'FooService',
        },
        {
          definition: './BarServiceDefinition.js',
          implementation: './BarServiceImplementation.js',
          name: 'BarService',
        },
      ];
      const fbservices3json = [
        {
          implementation: './BazService.js',
          name: 'BazService',
          preserveFunctionNames: true,
        },
      ];
      configPath = await fixtures.generateFixture('services', new Map([
        ['services-3.json', JSON.stringify(services3json)],
        ['fb-services-3.json', JSON.stringify(fbservices3json)],
      ]));
    });
  });

  it('resolves absolute paths', () => {
    invariant(configPath);
    const servicesConfig = loadServicesConfig(configPath);
    servicesConfig.forEach(service => {
      expect(nuclideUri.isAbsolute(service.definition)).toBe(true);
      expect(nuclideUri.isAbsolute(service.implementation)).toBe(true);
    });
  });

  it('uses the implementation when the definition is missing', () => {
    invariant(configPath);
    const servicesConfig = loadServicesConfig(configPath);
    const fooService = servicesConfig
      .find(service => service.name === 'FooService');
    expect(fooService.definition).toBe(fooService.implementation);
  });

  it('respects preserveFunctionNames', () => {
    invariant(configPath);
    const servicesConfig = loadServicesConfig(configPath);

    const fooService = servicesConfig
      .find(service => service.name === 'FooService');
    expect(fooService.preserveFunctionNames).toBe(false);

    const barService = servicesConfig
      .find(service => service.name === 'BarService');
    expect(barService.preserveFunctionNames).toBe(false);

    const BazService = servicesConfig
      .find(service => service.name === 'BazService');
    expect(BazService.preserveFunctionNames).toBe(true);
  });
});
