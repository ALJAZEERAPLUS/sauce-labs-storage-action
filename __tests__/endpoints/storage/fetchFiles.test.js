const axios = require('axios');
const core = require('@actions/core');
const fetchFiles = require('../../../src/endpoints/storage/fetchFiles');

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
        'get-file-id-platform': 'ios', // default from Action.yml
      };

      core.getInput.mockImplementation((name) => mockValues[name]);
    });

    test('sends correct authorization header', async () => {
      await fetchFiles();

      expect(axios.get).toHaveBeenCalledWith('https://api.region.saucelabs.com/v1/storage/files', {
        headers: {
          Authorization: `Basic ${Buffer.from('username:access-key').toString('base64')}`,
        },
        params: {
          kind: 'ios',
          per_page: 100,
          page: 1,
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
            page: 1,
          }],
        },
      });

      await fetchFiles();

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

      await fetchFiles();

      expect(axios.get).toHaveBeenCalled();
      expect(core.setFailed).toHaveBeenCalledWith('File not found');
    });

    test('handles unexpected response code', async () => {
      axios.get.mockResolvedValue({
        status: 404,
      });

      await fetchFiles();

      expect(axios.get).toHaveBeenCalled();
      expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: Unexpected response code: 404');
    });

    test('handles unexpected response structure', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: {},
      });

      await fetchFiles();

      expect(axios.get).toHaveBeenCalled();
      expect(core.setFailed).toHaveBeenCalledWith('Unexpected error: Unexpected response structure');
    });

    test('handles exception', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      await fetchFiles();

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
        'get-file-id-platform': 'ios', // default from Action.yml
      };

      core.getInput.mockImplementation((name) => mockValues[name]);

      axios.get.mockResolvedValue({
        status: 200,
        data: {
          items: [
            {
              id: '1234',
              kind: 'android',
              metadata: { version: '1.1.1', version_code: 101 },
              description: 'Branch: develop',
            },
            {
              id: '5678',
              kind: 'ios',
              metadata: { short_version: '1.1.2', version: '102' },
              description: 'Branch: master',
            },
          ],
        },
      });
    });

    test.each`
      platform     | version     | expected
      ${'android'} | ${'1.1.1'}  | ${'1234'}
      ${'ios'}     | ${'1.1.2'}  | ${'5678'}
    `('filters by version', async ({ platform, version, expected }) => {
      mockValues['get-file-id-platform'] = platform;
      mockValues['get-file-id-app-version'] = version;
      core.getInput.mockImplementation((name) => mockValues[name]);

      await fetchFiles();

      expect(core.setOutput).toHaveBeenCalledWith('file-id', expected);
    });

    test.each`
      platform     | build     | expected
      ${'android'} | ${'101'}  | ${'1234'}
      ${'ios'}     | ${'102'}  | ${'5678'}
    `('filters by build', async ({ platform, build, expected }) => {
      mockValues['get-file-id-platform'] = platform;
      mockValues['get-file-id-app-build-number'] = build;
      core.getInput.mockImplementation((name) => mockValues[name]);

      await fetchFiles();

      expect(core.setOutput).toHaveBeenCalledWith('file-id', expected);
    });

    test.each`
      description | expected
      ${'develop'} | ${'1234'}
      ${'master'}  | ${'5678'}
    `('filters by description', async ({ description, expected }) => {
      mockValues['get-file-id-app-description'] = description;
      core.getInput.mockImplementation((name) => mockValues[name]);

      await fetchFiles();

      expect(core.setOutput).toHaveBeenCalledWith('file-id', expected);
    });
  });
});
