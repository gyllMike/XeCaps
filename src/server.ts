// // IMPORTS are the start of the file

// import Express server related libraries
import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';

// import Swagger display related libraries
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

// import your webserver configuration file
import config from './config.json';

// import your logic calls - add further items as required
import { echo } from './newecho';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminControlUserDetails,
  adminAuthLogout,
  adminControlUserDetailsUpdate,
  adminControlUserPasswordUpdate,
} from './auth';
import {
  adminMissionCreate,
  adminMissionInfo,
  adminMissionList,
  adminMissionRemove,
  adminMissionNameUpdate,
  adminMissionDescriptionUpdate,
  adminMissionTargetUpdate,
  adminAstronautAssign,
  adminAstronautUnassign,
} from './mission';
import {
  findControlUserIdFromSession,
  findControlUserIdFromSessionId,
} from './helpers';
import {
  astronautCreate,
  astronautPoolList,
  astronautDetailUpdate,
  astronautRemove,
  astronautGetInfo,
  sendLlmChat,
  llmChatHistory,
} from './astronaut';
import { clear } from './other';
import { launchVehicleCreate, launchVehicleInfo, launchVehicleList, launchVehicleRetire, launchVehicleUpdate } from './launchVehicle';
import { checkMissionId } from './newHelpers';
import {
  launchCreate,
  launchInfo,
  updateLaunchState,
  launchAstronautAllocate,
  launchList,
  launchAstronautDeallocate,
  payloadDeployedList
} from './launch';

// Set up web app
const app = express();

// Use middleware that allows us to access the JSON body of requests
app.use(json());

// Use middleware that allows for access from other domains
app.use(cors());

// for logging errors (print to terminal)
app.use(morgan('dev'));

// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use(
  '/docs',
  sui.serve,
  sui.setup(YAML.parse(file), {
    swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' },
  })
);

// Setting up the configuration for your webserver
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }
  return res.json(result);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const result = adminAuthRegister(email, password, nameFirst, nameLast);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const response = adminAuthLogin(email, password);
    res.status(200).json(response);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.get('/v1/admin/mission/list', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('controlUserSessionId');
    const controlUserId = findControlUserIdFromSessionId(sessionId);
    const response = adminMissionList(controlUserId);
    res.status(200).json(response);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.get('/v1/admin/mission/:missionid', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('controlUserSessionId');
    const missionId = parseInt(req.params.missionid);
    const controlUserId = findControlUserIdFromSessionId(sessionId);
    const info = adminMissionInfo(controlUserId, missionId);
    return res.status(200).json(info);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.delete('/clear', (req: Request, res: Response) => {
  clear();
  return res.status(200).json({});
});

app.post('/v1/admin/mission', (req: Request, res: Response) => {
  const sessionId = req.header('controlUserSessionId');
  const { name, description, target } = req.body;
  try {
    const result = adminMissionCreate(sessionId, name, description, target);
    // Success Response (200)
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.delete('/v1/admin/mission/:missionid', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('controlUserSessionId');
    const missionId = parseInt(req.params.missionid);
    const controlUserId = findControlUserIdFromSessionId(sessionId);
    adminMissionRemove(controlUserId, missionId);
    res.status(200).json({});
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

/**
 * GET /v1/admin/controluser/details
 *
 * Retrieve detailed information about a specific control user
 * based on a valid controlUserSessionId.
 *
 * @param {string} controlUserSessionId - A unique session ID (generated via UUID) that maps to a valid controlUserId.
 *
 * @returns {Object} 200 - Successful response containing user details
 * @returns {Object} 200.user
 * @returns {number} 200.user.controlUserId - The user's unique ID
 * @returns {string} 200.user.name - Full name (first and last name concatenated with a space)
 * @returns {string} 200.user.email - The user's registered email address
 * @returns {number} 200.user.numSuccessfulLogins - Total successful logins since registration
 * @returns {number} 200.user.numFailedPasswordsSinceLastLogin - Number of failed login attempts
 *                                                              since the last successful login
 *
 */
app.get('/v1/admin/controluser/details', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const controUserId = findControlUserIdFromSessionId(controlUserSessionId);
    const response = adminControlUserDetails(controUserId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

app.put('/v1/admin/controluser/details', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const controlUserId = findControlUserIdFromSessionId(controlUserSessionId);
    const { email, nameFirst, nameLast } = req.body;
    const response = adminControlUserDetailsUpdate(
      controlUserId,
      email,
      nameFirst,
      nameLast
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

app.put('/v1/admin/controluser/password', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const controlUserId = findControlUserIdFromSessionId(controlUserSessionId);
    const { oldPassword, newPassword } = req.body;
    const response = adminControlUserPasswordUpdate(
      controlUserId,
      oldPassword,
      newPassword
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/mission/{missionId}/name
 *
 * Update the name of a specific mission for a control user.
 * Requires a valid controlUserSessionId to authorize the action.
 *
 * @param {string} controlUserSessionId - A unique session ID (generated via UUID)
 *                                        that maps to a valid controlUserId.
 * @param {number} missionId - The ID of the mission to be updated (from URL path)
 * @param {string} name - The new name to assign to the mission
 *
 * @returns {Object} 200 - Successful response with empty body
 *
 */
app.put('/v1/admin/mission/:missionid/name', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const missionId = parseInt(req.params.missionid);
    const { name } = req.body;

    const controlUserId = findControlUserIdFromSessionId(controlUserSessionId);

    const response = adminMissionNameUpdate(controlUserId, missionId, name);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

// Pst /v1/admin/auth/logout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('controlUserSessionId');
    adminAuthLogout(sessionId);
    return res.status(200).json({});
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

/**
 * PUT /v1/admin/mission/{missionId}/description
 *
 * Update the description of a specific mission for a control user.
 * Requires a valid controlUserSessionId to authorize the action.
 *
 * @param {string} controlUserSessionId - A unique session ID (generated via UUID)
 *                                        that maps to a valid controlUserId.
 * @param {number} missionId - The ID of the mission to be updated (from URL path)
 * @param {string} description - The new description to assign to the mission
 *
 * @returns {Object} 200 - Successful response with empty body
 *
 */
app.put(
  '/v1/admin/mission/:missionid/description',
  (req: Request, res: Response) => {
    try {
      const controlUserSessionId = req.header('controlUserSessionId');
      const missionId = parseInt(req.params.missionid);
      const { description } = req.body;

      const controlUserId =
        findControlUserIdFromSessionId(controlUserSessionId);

      const response = adminMissionDescriptionUpdate(
        controlUserId,
        missionId,
        description
      );

      return res.status(200).json(response);
    } catch (error) {
      return res.status(error.statusCode).json({ error: error.message });
    }
  }
);

app.put(
  '/v1/admin/mission/:missionid/target',
  (req: Request, res: Response) => {
    const sessionId = req.header('controlUserSessionId');
    const missionId = parseInt(req.params.missionid);
    const { target } = req.body;
    try {
      const result = adminMissionTargetUpdate(sessionId, missionId, target);
      return res.json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.post('/v1/admin/astronaut', (req: Request, res: Response) => {
  const sessionId = req.header('controlUserSessionId');
  const { nameFirst, nameLast, rank, age, weight, height } = req.body;
  try {
    const result = astronautCreate(
      sessionId,
      nameFirst,
      nameLast,
      rank,
      age,
      weight,
      height
    );
    return res.json(result);
  } catch (e) {
    return res.status(e.status).json({ error: e.message });
  }
});

app.get('/v1/admin/astronaut/pool', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('controlUserSessionId');
    findControlUserIdFromSessionId(sessionId);
    const result = astronautPoolList();
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

/**
 * PUT /v1/admin/astronaut/{astronautId}
 *
 * Update the details of a specific astronaut for a control user.
 * Requires a valid controlUserSessionId to authorize the action.
 *
 * @param {string} controlUserSessionId - A unique session ID (generated via UUID)
 *                                        that maps to a valid controlUserId.
 * @param {number} astronautId - The ID of the astronaut to be updated (from URL path)
 * @param {string} nameFirst - The updated first name of the astronaut
 * @param {string} nameLast - The updated last name of the astronaut
 * @param {string} rank - The updated rank of the astronaut
 * @param {number} age - The updated age of the astronaut
 * @param {number} weight - The updated weight of the astronaut
 * @param {number} height - The updated height of the astronaut
 *
 * @returns {Object} 200 - Successful response with empty body
 */
app.put('/v1/admin/astronaut/:astronautid', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('controlUserSessionId');
    const astronautId = parseInt(req.params.astronautid);
    const { nameFirst, nameLast, rank, age, weight, height } = req.body;
    const controlUserId = findControlUserIdFromSession(sessionId);
    if (!controlUserId) {
      return res.status(401).json({ error: 'Empty controlUserId' });
    }
    const response = astronautDetailUpdate(
      astronautId,
      nameFirst,
      nameLast,
      rank,
      age,
      weight,
      height
    );
    return res.status(200).json(response);
  } catch (error) {
    res.status(error.statusCode).json({ error: error.message });
  }
});

app.delete(
  '/v1/admin/astronaut/:astronautid',
  (req: Request, res: Response) => {
    const sessionId = req.header('controlUserSessionId');
    const astronautId = parseInt(req.params.astronautid);
    try {
      const result = astronautRemove(sessionId, astronautId);
      return res.json(result);
    } catch (e) {
      return res.status(e.status).json({ error: e.message });
    }
  }
);

app.post(
  '/v1/admin/mission/:missionid/assign/:astronautid',
  (req: Request, res: Response) => {
    try {
      const controlUserSessionId = req.header('controlUserSessionId');
      const astronautId = parseInt(req.params.astronautid);
      const missionId = parseInt(req.params.missionid);
      const result = adminAstronautAssign(
        controlUserSessionId,
        missionId,
        astronautId
      );
      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.delete(
  '/v1/admin/mission/:missionid/assign/:astronautid',
  (req: Request, res: Response) => {
    try {
      const controlUserSessionId = req.header('controlUserSessionId');
      const astronautId = parseInt(req.params.astronautid);
      const missionId = parseInt(req.params.missionid);
      const result = adminAstronautUnassign(
        controlUserSessionId,
        missionId,
        astronautId
      );
      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.delete(
  '/v2/admin/mission/:missionid/assign/:astronautid',
  (req: Request, res: Response) => {
    try {
      const controlUserSessionId = req.header('controlUserSessionId');
      const astronautId = parseInt(req.params.astronautid);
      const missionId = parseInt(req.params.missionid);
      const result = adminAstronautUnassign(
        controlUserSessionId,
        missionId,
        astronautId
      );
      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.get('/v1/admin/astronaut/:astronautid', (req: Request, res: Response) => {
  const sessionId = req.header('controlUserSessionId');
  const astronautId = parseInt(req.params.astronautid);
  try {
    const controlUserId = findControlUserIdFromSessionId(sessionId);

    const response = astronautGetInfo(controlUserId, astronautId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.get('/v1/admin/launchvehicle/list', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const result = launchVehicleList(controlUserSessionId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.get('/v1/admin/launch/list', (req: Request, res: Response) => {
  const sessionId = req.header('controlUserSessionId');
  try {
    const result = launchList(sessionId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.status).json({ error: e.message });
  }
});

app.post('/v1/admin/launchvehicle', (req: Request, res: Response) => {
  const sessionId = req.header('controlUserSessionId');
  const {
    name,
    description,
    maxCrewWeight,
    maxPayloadWeight,
    launchVehicleWeight,
    thrustCapacity,
    maneuveringFuel,
  } = req.body;

  try {
    findControlUserIdFromSessionId(sessionId);
    const result = launchVehicleCreate(
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
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.get(
  '/v1/admin/launchvehicle/:launchvehicleid',
  (req: Request, res: Response) => {
    const launchVehicleId = parseInt(req.params.launchvehicleid);
    const sessionId = req.header('controlUserSessionId');
    try {
      findControlUserIdFromSessionId(sessionId);
      const result = launchVehicleInfo(launchVehicleId);
      return res.json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.post(
  '/v1/admin/mission/:missionid/launch',
  (req: Request, res: Response) => {
    const sessionId = req.header('controlUserSessionId');
    const missionId = parseInt(req.params.missionid);
    const { launchVehicleId, payload, launchParameters } = req.body;

    try {
      const controlUserId = findControlUserIdFromSessionId(sessionId);
      checkMissionId(missionId, controlUserId);
      const result = launchCreate(
        controlUserId,
        missionId,
        launchVehicleId,
        payload,
        launchParameters
      );
      return res.json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.get(
  '/v1/admin/mission/:missionid/launch/:launchid',
  (req: Request, res: Response) => {
    const sessionId = req.header('controlUserSessionId');
    const missionId = parseInt(req.params.missionid);
    const launchId = parseInt(req.params.launchid);

    try {
      const controlUserId = findControlUserIdFromSessionId(sessionId);
      checkMissionId(missionId, controlUserId);
      const result = launchInfo(controlUserId, missionId, launchId);
      return res.json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.put(
  '/v1/admin/mission/:missionid/launch/:launchid/status',
  (req: Request, res: Response) => {
    const sessionId = req.header('controlUserSessionId');
    const missionId = parseInt(req.params.missionid);
    const launchId = parseInt(req.params.launchid);
    const { action } = req.body;

    try {
      const controlUserId = findControlUserIdFromSessionId(sessionId);
      checkMissionId(missionId, controlUserId);
      const result = updateLaunchState(action, launchId);
      return res.json(result);
    } catch (e) {
      return res.status(e.status).json({ error: e.message });
    }
  }
);

app.delete(
  '/v1/admin/launchvehicle/:launchvehicleid',
  (req: Request, res: Response) => {
    const sessionId = req.header('controlUserSessionId');
    const launchVehicleId = parseInt(req.params.launchvehicleid);

    try {
      findControlUserIdFromSessionId(sessionId);
      const result = launchVehicleRetire(launchVehicleId);
      return res.json(result);
    } catch (e) {
      return res.status(e.status).json({ error: e.message });
    }
  }
);

/**
 * PUT /v1/admin/launchvehicle/{launchvehicleid}
 *
 * Update the details of a specific lauch vehicle.
 * Requires a valid controlUserSessionId to authorize the actions.
 *
 * @param {string} controlUserSessionId - A unique session ID (generated via UUID)
 *                                        that maps to a valid controlUserId.
 * @param {number} launchvehicleid - The ID of the launchVehicle to be updated (from URL path)
 * @param {string} name - The updated first name of the launch vechicle
 * @param {string} description - The updated description of launch vechicle
 * @param {number} maxCrewWeight - The updated maxCrewWeight of the launch vechicle
 * @param {number} maxPayloadWeight - The updated maxPayloadWeight of the launch vechicle
 * @param {number} launchVehicleWeight - The updated launchVehicleWeight of the launch vechicle
 * @param {number} thrustCapacity - The updated thrustCapacity of the launch vechicle
 * @param {number} maneuveringFuel - the updated maneuveringFuel of the launch vechicle
 *
 * @returns {Object} 200 - Successful response with empty object
 */
app.put('/v1/admin/launchvehicle/:launchvehicleid', (req: Request, res: Response) => {
  try {
    const sessionId = req.header('controlUserSessionId');
    const launchVehicleId = parseInt(req.params.launchvehicleid);
    const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = req.body;
    findControlUserIdFromSessionId(sessionId);
    const response = launchVehicleUpdate(launchVehicleId, name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(error.status).json({ error: error.message });
  }
});

app.post(
  '/v1/admin/astronaut/:astronautid/llmchat',
  (req: Request, res: Response) => {
    try {
      const astronautId = parseInt(req.params.astronautid);
      const { messageRequest } = req.body;
      const result = sendLlmChat(astronautId, messageRequest);
      res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.get(
  '/v1/admin/astronaut/:astronautid/llmchat',
  (req: Request, res: Response) => {
    try {
      const astronautId = parseInt(req.params.astronautid);
      const result = llmChatHistory(astronautId);
      res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.post(
  '/v1/admin/mission/:missionid/launch/:launchid/allocate/:astronautid',
  (req: Request, res: Response) => {
    try {
      const sessionId = req.header('controlUserSessionId');
      const missionId = parseInt(req.params.missionid);
      const launchId = parseInt(req.params.launchid);
      const astronautId = parseInt(req.params.astronautid);

      const controlUserId = findControlUserIdFromSessionId(sessionId);

      checkMissionId(missionId, controlUserId);

      const result = launchAstronautAllocate(
        controlUserId,
        missionId,
        launchId,
        astronautId
      );

      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.statusCode).json({ error: e.message });
    }
  }
);

app.delete('/v1/admin/mission/:missionid/launch/:launchid/allocate/:astronautid', (req: Request, res: Response) => {
  const controlUserSessionId = req.header('controlUserSessionId');
  const astronautId = parseInt(req.params.astronautid);
  const missionId = parseInt(req.params.missionid);
  const launchId = parseInt(req.params.launchid);
  try {
    const result = launchAstronautDeallocate(controlUserSessionId, astronautId, missionId, launchId);
    return res.json(result);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.get('/v1/admin/payload/deployedList', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const result = payloadDeployedList(controlUserSessionId);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(e.statusCode).json({ error: e.message });
  }
});

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
