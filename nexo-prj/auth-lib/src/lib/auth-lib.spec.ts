import { authLib } from './auth-lib.js';

describe('authLib', () => {
  it('should work', () => {
    expect(authLib()).toEqual('auth-lib');
  });
});
