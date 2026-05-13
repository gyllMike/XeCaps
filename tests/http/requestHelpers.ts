import request from 'sync-request-curl';
const port = config.port;
const url = config.url;

const SERVER_URL = `${url}:${port}`;

export function adminMissionTransferRequest(controlUserSessionId, missiondId, userEmail) {
  const response = request(
    'POST',
        `${SERVER_URL}/v1/admin/mission/${missiondId}/tranfer`,
        {
          json: { userEmail },
          headers: { controlUserSessionId }
        }
  );

  return response;
}
