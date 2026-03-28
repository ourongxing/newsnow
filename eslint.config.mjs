import { ourongxing, react } from "@ourongxing/eslint-config"

export default ourongxing({
  type: "app",
  // 貌似不能 ./ 开头，
  ignores: ["src/routeTree.gen.ts", "imports.app.d.ts", "public/", ".vscode", "**/*.json"],
}).append(react({
  files: ["src/**"],
})).append({
  files: ["src/**"],
  rules: {
    // @eslint-react/eslint-plugin@2.13+ renamed these rules
    "react/ensure-forward-ref-using-ref": "off",
    "react/no-comment-textnodes": "off",
    "react/no-nested-components": "off",
    "react/prefer-shorthand-boolean": "off",
    "react/prefer-shorthand-fragment": "off",
    "react-dom/no-children-in-void-dom-elements": "off",
    "react/jsx-no-comment-textnodes": "warn",
    "react/no-nested-component-definitions": "warn",
    "react/jsx-shorthand-boolean": "warn",
    "react/jsx-shorthand-fragment": "warn",
    "react-dom/no-void-elements-with-children": "warn",
    // requires type-aware linting not configured in this project
    "react/no-implicit-key": "off",
  },
})
