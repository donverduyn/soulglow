import React, { act } from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { AppRuntime } from 'modules/App/context';
import EndpointPanel from 'modules/EndpointPanel/main';

describe('endpointPanel', () => {
  beforeEach(cleanup);

  it('should add an endpoint to the list when the "Add Endpoint" button is clicked', async () => {
    expect.hasAssertions();
    const WrappedComponent = WithRuntime(AppRuntime)(EndpointPanel);
    render(<WrappedComponent />);

    // Find the "Add Endpoint" button
    const addButton = screen.getByText(/Add endpoint/i);
    expect(addButton).toBeInTheDocument();

    act(() => {
      // Click the "Add Endpoint" button
      fireEvent.click(addButton);
    });

    // Verify that an item is added to the list
    await waitFor(() => {
      const endpointItems = screen.getAllByDisplayValue(
        'http://localhost:8081'
      );
      expect(endpointItems).toHaveLength(2);
    });
  });
});
