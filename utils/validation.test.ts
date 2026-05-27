import { isNonEmpty, isValidEmail, validatePassword, withinMaxLength } from './validation';

describe('isValidEmail', () => {
  it('accepts a well-formed address', () => {
    expect(isValidEmail('traveler@dara.app')).toBe(true);
  });

  it.each(['', 'no-at-sign', 'missing@domain', 'spaces @x.com'])('rejects "%s"', (bad) => {
    expect(isValidEmail(bad)).toBe(false);
  });
});

describe('isNonEmpty', () => {
  it('treats whitespace-only as empty', () => {
    expect(isNonEmpty('   ')).toBe(false);
    expect(isNonEmpty(' hi ')).toBe(true);
  });
});

describe('withinMaxLength', () => {
  it('enforces the limit', () => {
    expect(withinMaxLength('abc', 3)).toBe(true);
    expect(withinMaxLength('abcd', 3)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects short passwords with a message', () => {
    expect(validatePassword('12345')).toMatch(/at least 6/);
  });

  it('accepts a long-enough password', () => {
    expect(validatePassword('secret123')).toBeNull();
  });
});
