import request from 'sync-request-curl';
import config from './config.json';
import { LaunchInput } from './dataStore';

const SERVER_URL = `${config.url}:${config.port}`;
const TIMEOUT_MS = 5 * 1000;

export function requestAdminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast },
    timeout: TIMEOUT_MS
  });
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

/**
 * Send POST '/v1/admin/auth/login' request
 *
 * @param email
 * @param password
 * @returns { statusCode: res.statusCode,body: JSON.parse(res.body as string)}
 */
export function requestadminAuthLogin(email: string, password: string) {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password }
  });
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

export function requestadminMissionCreate(sessionId: string, name: string, description: string, target: string) {
  const res = request('POST', SERVER_URL + '/v1/admin/mission', {
    headers: {
      controlUserSessionId: sessionId
    },
    json: {
      name,
      description,
      target
    },
    timeout: TIMEOUT_MS
  });
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

export function requestAdminMissionInfo(controlUserSessionId: string, missionId: number) {
  const res = request('GET', SERVER_URL + `/v1/admin/mission/${missionId}`, {
    headers: { controlUserSessionId },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

/**
 * Send get /v1/admin/mission/list request
 *
 * @param sessionId
 * @returns
 */
export function requestadminMissionList(sessionId: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/mission/list', {
    headers: { controlUserSessionId: sessionId },
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

/**
 * Send delete /v1/admin/mission/${missionId}
 *
 * @param sessionId
 * @param missionId
 * @returns
 */
export function requestadminMissionRemove(sessionId: string, missionId: number) {
  const res = request('DELETE', SERVER_URL + `/v1/admin/mission/${missionId}`, {
    headers: { controlUserSessionId: sessionId },
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

export function requestClear() {
  const res = request('DELETE', SERVER_URL + '/clear', {});
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

export function requestadminControlUserDetails(sessionId: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/controluser/details', {
    headers: {
      controlUserSessionId: sessionId
    },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

export function requestadminControlUserDetailsUpdate(sessionId: string, newemail: string, newnameFirst: string, newnameLast: string) {
  const res = request('PUT', SERVER_URL + '/v1/admin/controluser/details', {
    headers: {
      controlUserSessionId: sessionId
    },
    json: { email: newemail, nameFirst: newnameFirst, nameLast: newnameLast },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

export function requestadminControlUserPasswordUpdate(sessionId: string, oldPassword: string, newPassword: string) {
  const res = request('PUT', SERVER_URL + '/v1/admin/controluser/password', {
    headers: {
      controlUserSessionId: sessionId
    },
    json: { oldPassword: oldPassword, newPassword: newPassword },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString()),
  };
}

export function requestadminMissionNameUpdate(sessionId: string, missionId: number, newname: string) {
  const res = request('PUT', SERVER_URL + `/v1/admin/mission/${missionId}/name`, {
    headers: {
      controlUserSessionId: sessionId
    },
    json: { name: newname },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString()),
  };
}

export function requestadminMissionDescriptionUpdate(sessionId: string, missionId: number, newdescription: string) {
  const res = request('PUT', SERVER_URL + `/v1/admin/mission/${missionId}/description`, {
    headers: {
      controlUserSessionId: sessionId
    },
    json: { description: newdescription },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString()),
  };
}

export function requestadminMissionTargetUpdate(sessionId:string, missionId:number, newTarget: string) {
  const res = request('PUT', SERVER_URL + `/v1/admin/mission/${missionId}/target`, {
    headers: {
      controlUserSessionId: sessionId
    },
    json: { target: newTarget },
    timeout: TIMEOUT_MS
  });
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString()),
  };
}

/**
 * Send POST /v1/admin/auth/logout request
 *
 * @param sessionId
 * @returns
 */
export function requestadminAuthLogout(sessionId: string) {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/logout', {
    headers: { controlUserSessionId: sessionId },
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

/**
 * Sends an HTTP POST request to create a new astronaut.
 *
 * @param {string} sessionId
 * @param {string} nameFirst
 * @param {string} nameLast
 * @param {string} rank
 * @param {number} age
 * @param {number} weight
 * @param {number} height
 * @returns {{statusCode: number, body: object}} - The status code and parsed JSON body of the response.
 */
export function requestAstronautCreate(sessionId: string, nameFirst: string, nameLast: string, rank: string, age: number, weight: number, height: number) {
  const res = request('POST', SERVER_URL + '/v1/admin/astronaut', {
    headers: {
      controlUserSessionId: sessionId
    },
    json: {
      nameFirst,
      nameLast,
      rank,
      age,
      weight,
      height
    },
    timeout: TIMEOUT_MS
  });
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

/**
 * send get /v1/admin/astronaut/pool request
 *
 * @param sessionId
 * @returns
 */
export function requestastronautPoolList(sessionId: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/astronaut/pool', {
    headers: { controlUserSessionId: sessionId },
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

export function requestastronautDetailUpdate(sessionId: string, astronautid: number, nameFirst: string, nameLast: string, rank: string, age: number, weight: number, height: number) {
  const res = request('PUT', SERVER_URL + `/v1/admin/astronaut/${astronautid}`, {
    headers: { controlUserSessionId: sessionId },
    json: {
      nameFirst,
      nameLast,
      rank,
      age,
      weight,
      height
    },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

/**
 * Sends an HTTP DELETE request to remove an astronaut.
 *
 * @param {string} sessionId - The session ID of the logged-in user.
 * @param {number} astronautId - The ID of the astronaut to remove.
 * @returns {{statusCode: number, body: object}}
 */
export function requestAstronautRemove(sessionId: string, astronautId: number) {
  const res = request('DELETE', SERVER_URL + `/v1/admin/astronaut/${astronautId}`, {
    headers: {
      controlUserSessionId: sessionId
    },
    timeout: TIMEOUT_MS
  });
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString()),
  };
}

/**
 * Sends an HTTP get request to get info of an astronaut.
 *
 * @param {string} sessionId - The session ID of the logged-in user.
 * @param {number} astronautId - The ID of the astronaut
 * @returns {{statusCode: number, body: object}}
 */
export function requestastronautGetInfo(sessionId: string, astronautid: number) {
  const res = request('GET', SERVER_URL + `/v1/admin/astronaut/${astronautid}`, {
    headers: { controlUserSessionId: sessionId },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

/**
 *
 * @param controlUserSessionId
 * @param astronautId
 * @param missionId
 * @returns
 */
export function requestAdminAstronautAssign(controlUserSessionId: string, astronautId: number, missionId: number) {
  const res = request('POST', SERVER_URL + `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    headers: { controlUserSessionId },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

export function requestAdminAstronautUnassignOld(controlUserSessionId: string, astronautId: number, missionId: number) {
  const res = request('DELETE', SERVER_URL + `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    headers: { controlUserSessionId },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

export function requestAdminAstronautUnassign(controlUserSessionId: string, astronautId: number, missionId: number) {
  const res = request('DELETE', SERVER_URL + `/v2/admin/mission/${missionId}/assign/${astronautId}`, {
    headers: { controlUserSessionId },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

export function adminLaunchVehicleCreateRequest(
  controlUserSessionId: string,
  name: string,
  description: string,
  maxCrewWeight: number,
  maxPayloadWeight: number,
  launchVehicleWeight: number,
  thrustCapacity: number,
  maneuveringFuel: number
) {
  const result = request('POST',
        `${SERVER_URL}/v1/admin/launchvehicle`,
        {
          json: {
            name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel
          },
          headers: {
            controlUserSessionId
          }
        }
  );
  return result;
}

export function adminLaunchVehicleInfoRequest(
  controlUserSessionId: string,
  launchVehicleId: number
) {
  const result = request('GET',
        `${SERVER_URL}/v1/admin/launchvehicle/${launchVehicleId}`,
        {
          headers: {
            controlUserSessionId
          }
        }
  );
  return result;
}

export function adminLaunchCreateRequest(controlUserSessionId: string,
  missionId: number,
  launchInputParams: LaunchInput
) {
  const result = request('POST',
        `${SERVER_URL}/v1/admin/mission/${missionId}/launch`,
        {
          json: {
            launchVehicleId: launchInputParams.launchVehicleId,
            payload: launchInputParams.payload,
            launchParameters: launchInputParams.launchParameters
          },
          headers: {
            controlUserSessionId
          }
        }
  );
  return result;
}

export function adminLaunchInfoRequest(controlUserSessionId: string,
  missionId: number,
  launchId: number
) {
  const result = request('GET',
        `${SERVER_URL}/v1/admin/mission/${missionId}/launch/${launchId}`,
        {
          headers: {
            controlUserSessionId
          }
        }
  );
  return result;
}

export function adminLaunchStateUpdateRequest(controlUserSessionId: string,
  missionId: number,
  launchId: number,
  action: string
) {
  const result = request('PUT',
        `${SERVER_URL}/v1/admin/mission/${missionId}/launch/${launchId}/status`,
        {
          headers: {
            controlUserSessionId
          },
          json: {
            action
          }
        }
  );
  return result;
}

export function launchVehicleRetireRequest(controlUserSessionId: string,
  launchVehicleId: number
) {
  const result = request('DELETE',
        `${SERVER_URL}/v1/admin/launchvehicle/${launchVehicleId}`,
        {
          headers: {
            controlUserSessionId
          },
        }
  );
  return result;
}

export function requestSendLlmChat(astronautId: number, messageRequest: string) {
  const res = request('POST', SERVER_URL + `/v1/admin/astronaut/${astronautId}/llmchat`, {
    json: {
      messageRequest,
    }
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

export function requestLlmChatHistory(astronautId: number) {
  const res = request('GET', SERVER_URL + `/v1/admin/astronaut/${astronautId}/llmchat`);

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

export function requestAdminLaunchVechileList(controlUserSessionId: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/launchvehicle/list', {
    headers: { controlUserSessionId },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

export function requestlaunchVehicleUpdate(sessionId: string, launchVehicleId: number, name: string, description: string, maxCrewWeight: number, maxPayloadWeight: number, launchVehicleWeight: number, thrustCapacity: number, maneuveringFuel: number) {
  const res = request('PUT', SERVER_URL + `/v1/admin/launchvehicle/${launchVehicleId}`, {
    headers: { controlUserSessionId: sessionId },
    json: {
      name,
      description,
      maxCrewWeight,
      maxPayloadWeight,
      launchVehicleWeight,
      thrustCapacity,
      maneuveringFuel
    },
    timeout: TIMEOUT_MS
  });

  return {
    stausCode: res.statusCode,
    body: JSON.parse(res.body as string),
  };
}

export function requestLaunchList(sessionId: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/launch/list', {
    headers: {
      controlUserSessionId: sessionId
    },
    timeout: TIMEOUT_MS
  });
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

export function requestlaunchAllocate(
  controlUserSessionId: string,
  missionId: number,
  launchId: number,
  astronautId: number
) {
  const result = request(
    'POST',
    `${SERVER_URL}/v1/admin/mission/${missionId}/launch/${launchId}/allocate/${astronautId}`,
    {
      headers: {
        controlUserSessionId
      },
    }
  );

  return {
    statusCode: result.statusCode,
    body: JSON.parse(result.body.toString())
  };
}

export function requestLaunchDeallocate(controlUserSessionId: string, astronautId: number, missionId: number, launchId: number) {
  const result = request('DELETE', SERVER_URL + `/v1/admin/mission/${missionId}/launch/${launchId}/allocate/${astronautId}`, {
    headers: { controlUserSessionId },
    timeout: TIMEOUT_MS
  });

  return {
    statusCode: result.statusCode,
    body: JSON.parse(result.body.toString())
  };
}

export function requestPayloadDeployedList(controlUserSessionId: string) {
  const result = request('GET', SERVER_URL + '/v1/admin/payload/deployedList', {
    headers: { controlUserSessionId },
    timeout: TIMEOUT_MS
  });
  return {
    statusCode: result.statusCode,
    body: JSON.parse(result.body.toString())
  };
}
