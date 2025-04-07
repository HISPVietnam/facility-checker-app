const config = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [{ subject: "/skip-release/", release: false }]
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          issuePrefixes: ["#"],
          issueUrlFormat: "https://projects.hispvietnam.org/work_packages/{{id}}"
        }
      }
    ],
    "@semantic-release/changelog",
    [
      "@semantic-release/exec",
      {
        prepareCmd: "VERSION=${nextRelease.version} node version.js && yarn build"
      }
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false, // Set to true if you want to publish to npm
        pkgRoot: "." // Ensures package.json is updated in the root directory
      }
    ],
    [
      "@semantic-release/git",
      {
        message: "chore(release): cut ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    [
      "@semantic-release/github",
      {
        assets: [{ path: "dist/fca.zip", label: "Facility Checker App installation file" }]
      }
    ]
  ]
};

export default config;
