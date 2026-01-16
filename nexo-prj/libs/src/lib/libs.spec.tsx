import { render } from '@testing-library/react';

import NexoPrjUi from './libs';

describe('NexoPrjUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NexoPrjUi />);
    expect(baseElement).toBeTruthy();
  });
});
