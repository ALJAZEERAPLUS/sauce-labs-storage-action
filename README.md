# Sauce Labs Storage Github Action

GitHub Actions to deploy an app (.apk or .ipa) to Sauce Labs Storage or get a file ID from Sauce Labs Storage.

## Sample usage

### Upload 

To upload a file to Sauce Labs Storage, you could follow the example below:

```yml
name: Build & upload to Sauce Labs Storage

on: [push]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: set up JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8

    - name: build release 
      run: ./gradlew assembleRelease

    - name: Upload to the Amazon AppStore
      uses: ALJAZEERAPLUS/sauce-labs-storage-action@v2
      with:
        endpoint-action: upload
        file-path: app/build/outputs/apk/release/app-release.apk
        sauce-labs-username: ${{ secrets.SAUCELABS_USERNAME }}
        sauce-labs-access-key: ${{ secrets.SAUCELABS_ACCESS_KEY }}
```

### Get File Id

To get the file ID from Sauce Labs Storage, you can follow the example below:

```yml
name: Run the End-to-end Tests

on: [push]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - run: npm install

    - uses: ALJAZEERAPLUS/sauce-labs-storage-action@v1
      id: sauce-labs-file-id
      with:
        endpoint-action: get-file-id
        sauce-labs-username: ${{ secrets.SAUCELABS_USERNAME }}
        sauce-labs-access-key: ${{ secrets.SAUCELABS_ACCESS_KEY }}
        get-file-id-platform: 'android'

    - run: FILE_ID=${{ steps.sauce-labs-id.outputs.file-id }} npm run tests
```

## :gear: Inputs

| Name                               | Description                                                    | Default                             | Required |
| ---------------------------------- | -------------------------------------------------------------- | ----------------------------------- | :------: |
| `endpoint-action`                  | Action to perform - options are "upload" or "get-file-id".     |                                     |   True   |
| `sauce-labs-username`              | Username credential.                                           |                                     |   True   |
| `sauce-labs-access-key`            | Access key credential.                                         |                                     |   True   |
| `sauce-labs-data-center-host-name` | Data Center hostname.                                          | https://api.us-west-1.saucelabs.com |  False   |
| `upload-file-path`                 | App file path (required for upload artifact).                  |                                     |  False   |
| `upload-artifact-description`      | App build description (required for upload artifact).          |                                     |  False   |
| `get-file-id-platform`             | Platform to get the file from (required for get artifact).     | "ios"                               |  False   |
| `get-file-id-version`              | Version to get the file from (required for get artifact).      | "1.0.0"                             |  False   |
| `get-file-id-build`                | Build number to get the file from (required for get artifact). | 1                                   |  False   |
| `get-file-id-description`          | Description to get the file from (required for get artifact).  | "Built from branch: develop."       |  False   |

## :gear: Outputs

| Name      | Description                   |
| --------- | ----------------------------- |
| `file-id` | File ID uploaded or retrieved |

## :thought_balloon: Support

If you find our work helpful but something is missing, please raise a pull request to review it!
