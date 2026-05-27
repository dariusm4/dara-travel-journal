import reducer, { setAuthError, setSubmitting, setUser } from './authSlice';

describe('authSlice', () => {
  const initial = reducer(undefined, { type: '@@INIT' });

  it('starts in the initializing state with no user', () => {
    expect(initial.status).toBe('initializing');
    expect(initial.user).toBeNull();
  });

  it('setUser with a user authenticates and clears any error', () => {
    const withError = { ...initial, authError: 'boom' };
    const next = reducer(withError, setUser({ uid: '1', email: 'a@b.com' }));
    expect(next.status).toBe('authenticated');
    expect(next.user?.email).toBe('a@b.com');
    expect(next.authError).toBeNull();
  });

  it('setUser with null logs the user out', () => {
    const authed = reducer(initial, setUser({ uid: '1', email: 'a@b.com' }));
    const next = reducer(authed, setUser(null));
    expect(next.status).toBe('unauthenticated');
    expect(next.user).toBeNull();
  });

  it('tracks submitting and error flags independently', () => {
    expect(reducer(initial, setSubmitting(true)).submitting).toBe(true);
    expect(reducer(initial, setAuthError('nope')).authError).toBe('nope');
  });
});
