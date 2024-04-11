# Playwright Sample

Try out Playwright for UI and API automation

## Description

Runs automated UI tests (in Windows and Ubuntu for now)

### Features

- Run UI tests in Chrome, Firefox, and Edge
- Allure report after every run
  - On test failure, screenshot(s) is added to report
- For every pull request, tests are ran to make sure nothing is broken

## Getting Started

### Installing

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