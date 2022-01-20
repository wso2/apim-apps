# Running tests against a pack

This branch contains the UI tests for API Manager 3.2.0. See the following steps to run the tests against the required pack.

## Prerequisites

Install NodeJS 14.x or later LTS version from [https://nodejs.org/en/download/](https://nodejs.org/en/download/).

> **_Note :-_**
>
> You may use [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) tool to manage NodeJS on your development environment. You can use the following steps to switch to node 14.
> ```
> nvm install 14
> nvm use 14
> ```

## Running the tests

1. Start the pack.
2. Navigate to the `tests/` directory.
3. Run the following commands from the `tests/` directory.
   1. `npm ci` to reinstall the dependencies.
   2. `npm run test` to run the tests against the running pack.
4. A report will be generated with the test results.

> **_Note :-_**
>  Currently the **application sharing feature** and the **product profiles** are not added to the tests. Therefore, they need to be tested manually.

## Troubleshooting

If there are any test failures, you can run the dev server and run the failed test cases in order to identify where the failure occurs.

Use the below command to run the test server,

```
npm run test:dev
```
