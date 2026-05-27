import { render, screen } from '@testing-library/react-native';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('shows the title and message', () => {
    render(<EmptyState title="No trips yet" message="Add your first one" />);
    expect(screen.getByText('No trips yet')).toBeTruthy();
    expect(screen.getByText('Add your first one')).toBeTruthy();
  });

  it('renders without a message', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.queryByText('Add your first one')).toBeNull();
  });
});
