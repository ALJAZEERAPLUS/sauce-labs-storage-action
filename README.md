# Sauce Labs Storage Github Action

GitHub Actions to deploy an app (.apk or .ipa) to Sauce Labs Storage.

## Inputs

### `file-path`

**Required** App file path

### `sauce-labs-username`

**Required** Username credential.

### `sauce-labs-access-key`

**Required** Access key credential.

### `sauce-labs-data-center-host-name`

Data Center hostname
### `sauce-labs-artifact-description`

App build description

## Outputs

###  `file-id`

File ID uploaded

## Sample usage

```yml
name: Build & upload to Sauce Labs Storage

on: [push]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: set up JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8
    - name: build release 
      run: ./gradlew assembleRelease
    - name: Upload to the Amazon AppStore
      uses: ALJAZEERAPLUS/sauce-labs-storage-action@v1
      with:
        file-path: app/build/outputs/apk/release/app-release.apk
        sauce-labs-username: ${{ secrets.SAUCELABS_USERNAME }}
        sauce-labs-access-key: ${{ secrets.SAUCELABS_ACCESS_KEY }}
```

## :gear: Inputs

| Name                             | Description            |                                                         Default                                                         | Required |
| -------------------------------- | ---------------------- | :---------------------------------------------------------------------------------------------------------------------: | :------: |
| file-path                        | App file path.         |                                                                                                                         |   True   |
| sauce-labs-username              | Username credential.   |                                                                                                                         |   True   |
| sauce-labs-access-key            | Access key credential. |                                                                                                                         |   True   |
| sauce-labs-data-center-host-name | Data Center hostname.  |                                           https://api.us-west-1.saucelabs.com                                           |  False   |
| sauce-labs-artifact-description  | App build description. | Built from branch: master. Workflow URL: https://github.com/ALJAZEERAPLUS/sauce-labs-storage-action/actions/runs/999999 |  False   |


## :gear: Outputs

|  Name   |   Description    |
| :-----: | :--------------: |
| file-id | File ID uploaded |
## :thought_balloon: Support

If you find our work useful, but for some reason there is something missing, please raise a pull request to us review it!
