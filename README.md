# NG-MENTIONS

[![Browser Tests And Coverage](https://github.com/nth-cloud/ng-mentions/actions/workflows/browser-tests.yml/badge.svg)](https://github.com/nth-cloud/ng-mentions/actions/workflows/browser-tests.yml)
[![npm version](https://badge.fury.io/js/%40nth-cloud%2Fng-mentions.svg)](https://badge.fury.io/js/%40nth-cloud%2Fng-mentions)
[![codecov](https://codecov.io/gh/nth-cloud/ng-mentions/branch/master/graph/badge.svg)](https://codecov.io/gh/nth-cloud/ng-mentions)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/ng-mentions.svg)](https://saucelabs.com/u/ng-mentions)

Native Angular components & directives for customizable mentions. Allowing for customizable search results and mention formatting.

## Demo and Docs

View it in action at https://nth-cloud.github.io/ng-mentions

## Dependencies
* [Angular](https://angular.io) (tested with 12.2.3)

| ng-mentions | Angular | Active Support |
| ----------- | ------- |:---------:|
| 0.x.x       | 5.2.1   | :x: |
| 1.x.x       | 6.1.0   | :x: |
| 2.x.x       | 7.0.0   | :x: |
| 3.x.x       | 8.0.0   | :x: |
| 4.x.x       | 9.0.0   | :x: |
| 5.x.x       | 10.0.0  | :white_check_mark: |
| 6.x.x       | 11.0.0  | :white_check_mark: |
| 7.x.x       | 11.0.0  | :white_check_mark: |

## Installation

We strongly recommend using [Angular CLI](https://cli.angular.io) for setting up a new project. If you have an Angular &ge; 9 CLI project, you could simply use our schematics to add ng-mentions library to it.

Just run the following:

```shell
ng add @nth-cloud/ng-mentions
```

It will install ng-mentions for the default application specified in your `angular.json`.
If you have multiple projects and you want to target a specific application, you could specify the `--project` option:

```shell
ng add @nth-cloud/ng-mentions --project myProject
```

If you prefer not to use schematics and install everything manually, please refer to the
[manual installation instructions](https://nth-cloud.github.io/ng-mentions/#/home) on our website.

## Supported browsers
We strive to support the same browsers and versions as supported by Angular.
See [Angular Browser Support](https://github.com/angular/angular/blob/master/README.md) for more details.

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)
