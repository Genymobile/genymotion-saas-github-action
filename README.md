# genymotion-saas-github-action

GitHub action to start Genymotion Cloud SaaS instances using the
[`gmsaas` command-line client](https://docs.genymotion.com/gmsaas/1.x/). It
installs and configures the CLI with Genymotion Cloud SaaS credentials. Note
that credentials keys should be stored as [GitHub secrets](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-an-organization).


## Inputs

- `email` {string} {required} Email of your Genymotion Cloud SaaS account, if you don't have an account please create it first at [https://cloud.geny.io](https://cloud.geny.io/?&utm_source=web-referral&utm_medium=docs&utm_campaign=githubactions&utm_content=signup). `GMSAAS_EMAIL` should be stored as a [GitHub secret](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-an-organization) and passed as in the
  example below. **Never** store your `GMSAAS_EMAIL` as plain text in your YAML workflow.
- `password` {string} {required} The password of your Genymotion Cloud SaaS account. `GMSAAS_PASSWORD` should be stored as a [GitHub secret](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-an-organization) and passed as in the
  example below. **Never** store your `GMSAAS_PASSWORD` as plain text in your YAML workflow.
- `gmsaas_version` {string} {optional} Install a specific version of gmsaas (not recommended). Defaults to the latest version if not specified.
- `recipe_uuid` {string} {optional} Recipe UUID is the identifier used when starting an instance; it can be retrieved using `gmsaas recipes list`,
or check [availables recipes](https://support.genymotion.com/hc/en-us/articles/360007473658-Supported-Android-devices-templates-for-Genymotion-Cloud-SaaS) for a comprehensive list of all currently available recipes.
- `adb_serial_port` {string} {optional} port which the instance will be connected to ADB. Defaults to None


## Requirements
This action requires the following dependencies to be installed as part of your workflow:
- `actions/setup-python`
- `actions/setup-java`
- `android-actions/setup-android`


## Simple workflow example:

```
on: [push]

name: Genymotion Cloud SaaS 

jobs:
  test:
    name: Start Genymotion Cloud SaaS instance
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - uses: actions/setup-python@v4
        with:
          python-version: "3.10.11"

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: "17"
          distribution: "temurin"

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Start Genymotion Cloud SaaS instance
        uses:  genymobile/genymotion-saas-github-action@v0.4
        with:
          email: ${{ secrets.GMSAAS_EMAIL }}
          password: ${{ secrets.GMSAAS_PASSWORD }}
          recipe_uuid: ea5fda48-fa8b-48c1-8acc-07d910856141 # Google Pixel XL 8.1
```

## Workflow example with multiple devices:

```
on: [push]

name: Genymotion Cloud SaaS 

jobs:
  test:
    name: Start Multiple Genymotion Cloud SaaS instances
    runs-on: ubuntu-latest
    strategy:
      matrix:
        recipe_uuid:
          - ea5fda48-fa8b-48c1-8acc-07d910856141 # android 8.1
          - 4c015ada-e64e-4f5d-a320-06cbf6e95648 # android 10
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - uses: actions/setup-python@v4
        with:
          python-version: "3.10.11"

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: "17"
          distribution: "temurin"

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Start Genymotion Cloud SaaS instance
        uses:  genymobile/genymotion-saas-github-action@v0.4
        with:
          email: ${{ secrets.GMSAAS_EMAIL }}
          password: ${{ secrets.GMSAAS_PASSWORD }}
          recipe_uuid: ${{ matrix.recipe_uuid }}
```

## Workflow example using ADB serial port:

```
on: [push]

name: Genymotion Cloud SaaS 

jobs:
  test:
    name: Start Genymotion Cloud SaaS instance with ADB serial port
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - uses: actions/setup-python@v4
        with:
          python-version: "3.10.11"

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: "17"
          distribution: "temurin"

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Start Genymotion Cloud SaaS instance
        uses:  genymobile/genymotion-saas-github-action@v0.4
        with:
          email: ${{ secrets.GMSAAS_EMAIL }}
          password: ${{ secrets.GMSAAS_PASSWORD }}
          recipe_uuid: ea5fda48-fa8b-48c1-8acc-07d910856141 # Google Pixel XL 8.1
          adb_serial_port: "47021"
```

## License

The scripts and documentation in this project are
released under the [MIT License](LICENSE).
