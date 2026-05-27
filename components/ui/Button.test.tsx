import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  it('renders its title', () => {
    render(<Button title="Save" onPress={() => {}} />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Save" onPress={onPress} />);
    fireEvent.press(screen.getByText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('hides the title and is disabled while loading', () => {
    render(<Button title="Save" onPress={() => {}} loading />);
    expect(screen.queryByText('Save')).toBeNull();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button title="Save" onPress={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
