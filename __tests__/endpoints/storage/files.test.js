const axios = require('axios');
const core = require('@actions/core');
const files = require('../../../src/endpoints/storage/files');

jest.mock('axios');
jest.mock('@actions/core');
let mockValues;

describe('Files Endpoint', () => {
  describe('Without filtering', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      mockValues = {
        'sauce-labs-username': 'username',
        'sauce-labs-access-key': 'access-key',
        'sauce-labs-data-center-host-name': 'https://api.region.saucelabs.com',
      };

      core.getInput.mockImplementation((name) => mockValues[name]);
    });

    test('sends correct authorization header', async () => {
      await files();

      expect(axios.get).toHaveBeenCalledWith(expect.anything(), {
        headers: {
          Authorization: `Basic ${Buffer.from('username:access-key').toString('base64')}`,
        },
      });
    });

    test('fetches file id successfully', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: {
          items: [{
            id: '1234',
            kind: 'android',
          }],
        },
      });

      await files();

      expect(axios.get).toHaveBeenCalled();
      expect(core.setOutput).toHaveBeenCalledWith('file-id', '1234');
      expect(core.info).toHaveBeenCalledWith('File ID: 1234');
    });

    test('handles no matching file found', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: {
          items: [],
        },
      });

      await files();

      expect(axios.get).toHaveBeenCalled();
      expect(core.setFailed).toHaveBeenCalledWith('No file found');
    });

    test('handles unexpected response code', async () => {
      axios.get.mockResolvedValue({
        status: 404,
      });

      await files();

      expect(axios.get).toHaveBeenCalled();
      expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: Unexpected response code: 404');
    });

    test('handles unexpected response structure', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: {},
      });

      await files();

      expect(axios.get).toHaveBeenCalled();
      expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: Unexpected response structure');
    });

    test('handles exception', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await files();

      expect(axios.get).toHaveBeenCalled();
      expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: Network error');
    });
  });

  describe('With Filtering', () => {
    beforeEach(() => {
      jest.resetAllMocks();

      mockValues = {
        'sauce-labs-username': 'username',
        'sauce-labs-access-key': 'access-key',
        'sauce-labs-data-center-host-name': 'https://api.region.saucelabs.com',
      };

      core.getInput.mockImplementation((name) => mockValues[name]);

      axios.get.mockResolvedValue({
        status: 200,
        data: {
          items: [
            {
              id: '1234', kind: 'android', metadata: { version: '1.1.1', version_code: 101 }, description: 'Branch: develop',
            },
            {
              id: '5678', kind: 'ios', metadata: { version: '1.1.2', version_code: 102 }, description: 'Branch: master',
            },
          ],
        },
      });
    });

    test.each`
      platform     | expected
      ${'android'} | ${'1234'}
      ${'ios'}     | ${'5678'}
    `('filters by platform', async ({ platform, expected }) => {
      mockValues['get-file-id-platform'] = platform;
      core.getInput.mockImplementation((name) => mockValues[name]);

      await files();

      expect(core.setOutput).toHaveBeenCalledWith('file-id', expected);
    });

    test.each`
      version     | expected
      ${'1.1.1'}  | ${'1234'}
      ${'1.1.2'}  | ${'5678'}
    `('filters by version', async ({ version, expected }) => {
      mockValues['get-file-id-version'] = version;
      core.getInput.mockImplementation((name) => mockValues[name]);

      await files();

      expect(core.setOutput).toHaveBeenCalledWith('file-id', expected);
    });

    test.each`
      build | expected
      ${101} | ${'1234'}
      ${102} | ${'5678'}
    `('filters by build', async ({ build, expected }) => {
      mockValues['get-file-id-build'] = build;
      core.getInput.mockImplementation((name) => mockValues[name]);

      await files();

      expect(core.setOutput).toHaveBeenCalledWith('file-id', expected);
    });

    test.each`
      description | expected
      ${'develop'} | ${'1234'}
      ${'master'}  | ${'5678'}
    `('filters by description', async ({ description, expected }) => {
      mockValues['get-file-id-description'] = description;
      core.getInput.mockImplementation((name) => mockValues[name]);

      await files();

      expect(core.setOutput).toHaveBeenCalledWith('file-id', expected);
    });
  });
});