import { render } from '@testing-library/react';

import NexoPrjSharedUi from './shared-ui';

describe('NexoPrjSharedUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NexoPrjSharedUi />);
    expect(baseElement).toBeTruthy();
  });
});
