// update your imports when you copy these routes in
import {
    controlUserIdFromControlUserSessionId,
    checkMissionId
} from './newHelpers';

import {
    launchInfo,
    launchCreate
} from './launch';

import {
    updateLaunchState
} from './updateSessionState';

import {
    launchVehicleInfo,
    launchVehicleCreate
} from '../../src/launchVehicle';

// copy these routes into your server.ts
app.post('/v1/admin/launchvehicle', (req: Request, res: Response) => {
  // 1. Handle Inputs
  // 2. check 401 errors
  // 3. check 403 errors
  // 4. call logic
  // 5. handle exceptions
  // 6. return appropriate status codes
  const {constrolUserSessionId} = req.headers;
  const {name, 
    description, 
    maxCrewWeight, 
    maxPayloadWeight, 
    launchVehicleWeight, 
    thrustCapacity, 
    maneuveringFuel} = req.body;

  let controlUserId;
  try {
    controlUserId = controlUserIdFromControlUserSessionId(controlUserSessionId);
    let result = launchVehicleCreate(
        name, 
        description, 
        maxCrewWeight, 
        maxPayloadWeight, 
        launchVehicleWeight, 
        thrustCapacity, 
        maneuveringFuel
    );
    return res.json(result);
  } catch (e) {
      return res.status(e.status).json({error: e.message});
  }
  
  
});

app.get('/v1/admin/launchvehicle/:launchvehicleid', (req: Request, res: Response) => {
  // 1. Handle Inputs
  // 2. check 401 errors
  // 3. check 403 errors
  // 4. call logic
  // 5. handle exceptions
  // 6. return appropriate status codes
  const launchVehicleId = parseInt(req.params.launchvehicleid);
  const {controlUserSessionId} = req.headers;

  try {
    let controlUserId = controlUserIdFromControlUserSessionId(controlUserSessionId);
    let result = launchVehicleInfo(launchVehicleId);
    return res.json(result);
  } catch (e) {

    return res.status(e.status).json({error: e.message});
}


});

app.post('/v1/admin/mission/:missionid/launch', (req: Request, res: Response) => {
  // 1. Handle Inputs
  // 2. check 401 errors
  // 3. check 403 errors
  // 4. call logic
  // 5. handle exceptions
  // 6. return appropriate status codes

  const {controlUserSessionId} = req.headers;
  const missionId = parseInt(req.params.missionid);
  const {launchVehicleId, payload, launchParameters};
  
  try {
    let controlUserId = controlUserIdFromControlUserSessionId(controlUserSessionId);
    checkMissionId(missionId, controlUserId);
    let result = launchCreate(controlUserId, missionId, launchVehicleId, payload, launchParameters);
    return res.json(result);
  } catch (e) {
    return res.status(e.status).json({error: e.message});
  }
  
});


app.get('/v1/admin/launch/:launchid', (req: Request, res: Response) => {
// 1. Handle Inputs
  // 2. check 401 errors
  // 3. check 403 errors
  // 4. call logic
  // 5. handle exceptions
  // 6. return appropriate status codes
  const {controlUserSessionId} = req.headers;
  const missionId = parseInt(req.params.missionid);
  const launchId = parseInt(req.params.launchid);
  
  try {
    let controlUserId = controlUserIdFromControlUserSessionId(controlUserSessionId);
    checkMissionId(missionId, controlUserId);
    let result = launchInfo(controlUserId, missionId, launchId);
    return res.json(result);
  } catch (e) {
    return res.status(e.status).json({error: e.message});
  }
});


app.put('/v1/admin/launch/:launchid', (req: Request, res: Response) => {
  // 1. Handle Inputs
  // 2. check 401 errors
  // 3. check 403 errors
  // 4. call logic
  // 5. handle exceptions
  // 6. return appropriate status codes

  const {controlUserSessionId} = req.headers;
  const missionId = parseInt(req.params.missionid);
  const launchId = parseInt(req.params.launchid);
  const {action} = req.body;
  
  try {
    let controlUserId = controlUserIdFromControlUserSessionId(controlUserSessionId);
    checkMissionId(missionId, controlUserId);
    let result = updateLaunchState(launchId, action);
    return res.json(result);
  } catch (e) {
    return res.status(e.status).json({error: e.message});
  }
});