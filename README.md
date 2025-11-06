# lexcentra-test

A small project for running end-to-end tests with Cypress.

## Purpose
This repository contains automated Cypress tests for verifying application features relevant to the project.

## Key structure
- `cypress/` — tests, fixtures, screenshots, videos, support code
  - `cypress/e2e/` — spec files (e.g. `lexgpt_ask_questions.cy.js`)
  - `cypress/fixtures/` — sample data (e.g. `questions.json`)
  - `cypress/support/` — custom commands and common setup
- `package.json` — helper scripts to run tests
- `.gitignore` — configured to ignore local secrets/artifacts (see Env section)

## Prerequisites
- Node.js (LTS) and npm (or yarn/pnpm)
- On Windows use `cmd.exe` for the examples below

## Install
Open a terminal in the project root and run:

```cmd
npm install
```

## Environment files (.env)

Create a local environment file named `.env.{environment}` by copying one of the templates and editing it with environment-specific values. For example (Windows `cmd.exe`):

```cmd
copy .env.template .env.dev
copy .env.template .env.stg
copy .env.template .env.prod
```

Edit the appropriate `.env.{environment}` file with values for that environment.

## npm scripts
- `test:dev` — open Cypress GUI with `CYPRESS_ENV=dev`
- `test:stg` — open Cypress GUI with `CYPRESS_ENV=stg`
- `test:prod` — open Cypress GUI with `CYPRESS_ENV=prod`

Run them from `cmd.exe`:

```cmd
npm run test:dev
npm run test:stg
npm run test:prod
```

Note: these scripts use `npx cypress open --browser electron` to launch the Electron GUI. To run tests headless, use `npx cypress run` with the proper `CYPRESS_ENV`:

```cmd
npx cross-env CYPRESS_ENV=dev npx cypress run --browser electron
```

## Notes
- Do not put real secrets into the `.template` or `.base` files if the repository is public.
- If you want to keep `cypress/screenshots` or `cypress/videos` in git, update `.gitignore` accordingly.

## Quick add / run flow
- Add a new spec file under `cypress/e2e/` and open the Cypress GUI via `npm run test:dev` to pick and run the spec.