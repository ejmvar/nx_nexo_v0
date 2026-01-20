import { sharedApi } from './shared-api.js';

describe('sharedApi', () => {
  it('should work', () => {
    expect(sharedApi()).toEqual('shared-api');
  });
});
