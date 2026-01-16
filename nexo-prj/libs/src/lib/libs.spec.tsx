import { render } from '@testing-library/react';

import NexoPrjLibs from './libs';

describe('NexoPrjLibs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NexoPrjLibs />);
    expect(baseElement).toBeTruthy();
  });
});
