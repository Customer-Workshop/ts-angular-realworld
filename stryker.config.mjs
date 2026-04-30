/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: "vitest",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  mutate: [
    "src/app/core/auth/services/jwt.service.ts",
    "src/app/core/auth/services/user.service.ts",
    "src/app/features/article/services/articles.service.ts",
    "src/app/features/article/services/comments.service.ts",
    "src/app/features/article/services/tags.service.ts",
    "src/app/features/profile/services/profile.service.ts",
  ],
  reporters: ["html", "clear-text", "progress"],
  coverageAnalysis: "perTest",
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
};
