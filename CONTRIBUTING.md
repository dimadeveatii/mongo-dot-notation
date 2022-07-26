# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

By contributing to, you agree to abide by the [code of conduct](CODE-OF-CONDUCT.md).

## Reporting issues

Before opening an issue, please search the [issue tracker](https://github.com/dimadeveatii/mongo-dot-notation/issues?q=) to make sure your issue hasn't already been reported.

## Development

Fork, then clone the repo:

```sh
git clone https://github.com/your-username/mongo-dot-notation.git
```

Install dependencies:

```sh
npm install
```

### Building

Running the `build` tasks builds TypeScript:

```sh
npm run build
```

### Linting

This repository uses _prettier_ for code formatting. To format code:

```sh
npm run prettier:fix
```

To perform linting:

```sh
npm run lint
```

### Testing

To run unit tests:

```sh
npm run test
```

To calculate code coverage:

```sh
npm run test:coverage
```

You can run _end to end_ tests if you have _docker_ and _docker-compose_ installed:

```sh
npm run test:e2e:docker
```

## Submitting changes

- Open a new issue in the [Issue tracker](https://github.com/dimadeveatii/mongo-dot-notation/issues).
- Fork the repo.
- Create a new feature branch based off the `main` branch.
- Make sure all tests pass and there are no linting errors.
  - For new features, make sure to cover the code with tests
  - For issues, please add a test case that covers it
- Submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including unrelated commits.

Thank you!
