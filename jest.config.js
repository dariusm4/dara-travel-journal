const expoPreset = require('jest-expo/jest-preset');

// Redux Toolkit and its dependencies ship ESM that babel-jest must transform;
// add them to the jest-expo allowlist instead of replacing the whole pattern.
const esmDeps = ['@reduxjs/toolkit', 'immer', 'redux', 'reselect', 'redux-thunk'];

const [firstPattern, ...restPatterns] = expoPreset.transformIgnorePatterns;
const mergedFirst = firstPattern.replace('(?!(', `(?!(${esmDeps.join('|')}|`);

/** @type {import('jest').Config} */
module.exports = {
  ...expoPreset,
  transformIgnorePatterns: [mergedFirst, ...restPatterns],
};
