module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ["plugin:react/recommended", "standard-with-typescript"],

  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json"]
  },

  plugins: ["@typescript-eslint", "react", "react-hooks"],
  rules: {
    // Note: you must disable the base rule as it can report incorrect errors
    quotes: "off",
    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/triple-slash-reference": "off"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
}
