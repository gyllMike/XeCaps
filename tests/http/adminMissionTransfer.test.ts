import request from 'sync-request-curl';
import config from '../../src/config.json';
import { adminMissionTransferRequest } from './requestHelpers';
// also need the following request helpers:
//  - adminAuthRegister
//  - adminMissionCreate
//  - adminMissionList
//  - clear

const port = config.port;
const url = config.url;

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  // call clearRequest() to reset the state
  // call adminAuthRegisterRequest() with sample data for User 1 to create a sample User 1
  // call adminAuthRegisterRequest() with sample data for User 2 to create a sample User 2
  // call adminMissionCreateRequest() with sample data for Mission 1 to create a sample Mission 1 for User 1
  // call adminMissionCreateRequest() with sample data for Mission 2 to create a sample Mission 2 for User 1
  // call adminMissionCreateRequest() with sample data for Mission 1 to create a sample Mission 3 for User 2
});
// skipping these tests for now
describe.skip('Success Tests', () => {
  test('Correct output', () => {
    // call adminMissionTransfer to transfer Mission 2 from User 1 to User 2
    // expect empty output {}
  });
  test('Datastore modification', () => {
    // call adminMissionTransfer to transfer Mission 2 from User 1 to User 2
    // call adminMissionListRequest() for User 2
    // expect User 2 to now have 2 missions with the second mission having a missionid to the original Mission 2 from User 1
  });
});
// skipping these tests for now
describe.skip('Expected Errors', () => {
  test('ControlUserSessionId is empty', () => {
    // call adminMissionTransfer with an empty controlUserSessionId
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 401.
  });
  test('ControlUserSessionId is invalid', () => {
    // call adminMissionTransfer with an invalid controlUserSessionId (concatenate User 1 controlUserSessionId and User 2 controlUserSessionId)
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 401.
  });
  test('ControlUserSessionId is invalid', () => {
    // call adminMissionTransfer with an invalid controlUserSessionId (concatenate User 1 controlUserSessionId and User 2 controlUserSessionId)
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 401.
  });
  test('ControlUserSessionId is invalid', () => {
    // call adminMissionTransfer with an invalid controlUserSessionId (concatenate User 1 controlUserSessionId and User 2 controlUserSessionId)
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 401.
  });
  test('missionid is empty', () => {
    // call adminMissionTransfer with empty missionid
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 403.
  });
  test('Mission does not belong to this User', () => {
    // call adminMissionTransfer with Mission 2 missionid but for User 2 controlUserSessionId.
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 403.
  });

  test('userEmail is not a real control user', () => {
    // call adminMissionTransfer with an email not in the system
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 400.
  });
  test('userEmail is the current logged in control user', () => {
    // call adminMissionTransfer with Mission 2 for User 1 to User 1
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 403.
  });
  test('missionId refers to a space mission that has a name that is already used by the target user', () => {
    // create Mission 4 using Sample Mission 2 for User 2
    // call adminMissionTransfer with Mission 2 to User 2.
    // expect the response body to equal {error: expect.any(String)}
    // expect the response status code to have a status of 403.
  });
});
