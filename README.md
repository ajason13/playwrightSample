# Playwright Sample

Try out Playwright for UI and API automation

## Description

Runs automated UI tests (in Windows and Ubuntu for now)

### Features

- Run UI tests in Chrome, Firefox, and Edge
- Allure report after every run
  - On test failure, screenshot(s) is added to report
- For every pull request, tests are ran to make sure nothing is broken
  - Historical runs can be found [here](https://ajason13.github.io/playwrightSample/)

## Getting Started

### Installing

- Clone repo
- [Install Allure locally](https://allurereport.org/docs/gettingstarted-installation/) if you want to view report(s).

### Executing program

- Run tests

```
npx playwright test
```

- Generate a report

```
npx allure serve allure-results
```
