import request, { HttpVerb } from 'sync-request-curl';
import {url, port} from '../../src/config.json';
import {LaunchInput} from '../src/newInterfaces';

const SERVER_URL = `${url}:${port}`;

export function clearRequest() {
    
    return request('DELETE',
        `${SERVER_URL}/clear`,
        {timeout: 2000} 
    );
};

export function adminAuthRegisterRequest() {
    // TODO :: Use your iteration 2 version or create a request helper function
}

export function adminMissionCreateRequest() {
    // TODO :: Use your iteration 2 version or create a request helper function
}

export function adminMissionInfoRequest() {
    // TODO :: Use your iteration 2 version or create a request helper function
}

export function adminAstronautCreateRequest() {
    // TODO :: Use your iteration 2 version or create a request helper function
}

export function adminAstronautAssignRequest() {
    // TODO :: Use your iteration 2 version or create a request helper function
}

export function adminLaunchVehicleCreateRequest(
    controlUserSessionId: string,
    name: string,
    description: string,
    maxCrewWeight: number,
    maxPayloadWeight: number,
    launchVehicleWeight: number,
    maneuveringFuel: number
) {
    // TODO :: Use your iteration 2 version or create a request helper function
    let result = request('POST',
        `${SERVER_URL}/v1/admin/launchvehicle`,
        {
            json: { 
                name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, maneuveringFuel
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
    let result = request('GET',
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
    let result = request('POST',
        `${SERVER_URL}/v1/admin/mission/${missionId}/launch`,
        {
            json: { 
                launchVehicleId: launchInputParams.launchVehicleId,
                payload: launchInputParams.payload,
                launchParams: launchInputParams.launchParameters
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
    let result = request('GET',
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
    let result = request('PUT',
        `${SERVER_URL}/v1/admin/mission/${missionId}/launch/${launchId}`,
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

export function adminAstronautAllocateRequest() {
    // TODO :: Use your iteration 2 version or create a request helper function
}

export function adminAstronautDeallocateRequest() {
    // TODO :: Use your iteration 2 version or create a request helper function
}