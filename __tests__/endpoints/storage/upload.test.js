/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const axios = require('axios');
const core = require('@actions/core');
const upload = require('../../../src/endpoints/storage/upload');

jest.mock('axios');
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
  setOutput: jest.fn(),
}));
jest.mock('fs');

let mockValues;

describe('Upload Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockValues = {
      'sauce-labs-username': 'username',
      'sauce-labs-access-key': 'access-key',
      'sauce-labs-data-center-host-name': 'https://api.region.saucelabs.com',
      'upload-file-path': '/path/to/file',
    };

    core.getInput.mockImplementation((name) => mockValues[name]);

    fs.existsSync.mockReturnValue(true);
    fs.createReadStream.mockReturnValue('streamData');
  });

  test('successfully uploads a file', async () => {
    axios.post.mockResolvedValue({
      status: 201,
      statusText: 'OK',
      data: {
        item: {
          id: '1234',
        },
      },
    });

    await upload();

    expect(axios.post).toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith('Response: 201 - OK');
    expect(core.info).toHaveBeenCalledWith('File uploaded successfully with ID: 1234');
    expect(core.setOutput).toHaveBeenCalledWith('file-id', '1234');
  });

  test('throws an error when file does not exist', async () => {
    fs.existsSync.mockReturnValue(false);

    await upload();

    expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: File not found at path: /path/to/file');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('throws an error when upload response is not 200', async () => {
    axios.post.mockResolvedValue({
      status: 500,
      statusText: 'Internal Server Error',
    });

    await upload();

    expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: Unexpected status: 500 - Internal Server Error');
    expect(axios.post).toHaveBeenCalled();
  });

  test('throws an error when upload response does not have an item', async () => {
    axios.post.mockResolvedValue({
      status: 201,
      statusText: 'OK',
      data: {},
    });

    await upload();

    expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: Response data is missing or incomplete');
    expect(axios.post).toHaveBeenCalled();
  });

  test('handles failure of the axios post request', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));

    await upload();

    expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: Network error');
  });

  test('successfully uploads a file with artifact description', async () => {
    mockValues['upload-artifact-description'] = 'artifact description';

    axios.post.mockResolvedValue({
      status: 201,
      statusText: 'OK',
      data: {
        item: {
          id: '1234',
        },
      },
    });

    axios.put.mockResolvedValue({
      status: 200,
      statusText: 'OK',
    });

    await upload();

    expect(axios.post).toHaveBeenCalled();
    expect(axios.put).toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith('Response: 200 - OK');
    expect(core.setOutput).toHaveBeenCalledWith('file-id', '1234');
  });
});
