import HTTPError from 'http-errors';
import {getData, setData} from './sampleDataStore';
import {missionLaunchState, 
    missionLaunchAction,
    Launch} from './newInterfaces';

import { checkLaunchIdValidity } from './newHelpers';

// these would most likely be defined in your dataStore or interfaces
// we have imported them from newInterfaces
// enum missionLaunchState {
//     READY_TO_LAUNCH = "READY_TO_LAUNCH",
//     LAUNCHING = "LAUNCHING",
//     MANEUVERING = "MANEUVERING",
//     COASTING = "COASTING",
//     MISSION_COMPLETE = "MISSION_COMPLETE",
//     REENTRY = "REENTRY",
//     ON_EARTH = "ON_EARTH"
// };

// enum missionLaunchAction {
//     LIFTOFF = "LIFTOFF",
//     CORRECTION = "CORRECTION",
//     FIRE_THRUSTERS = "FIRE_THRUSTERS",
//     DEPLOY_PAYLOAD = "DEPLOY_PAYLOAD",
//     GO_HOME = "GO_HOME",
//     FAULT = "FAULT",
//     RETURN = "RETURN"
//     SKIP_WAITING = "SKIP_WAITING" 
// };

// we also import Launch from newInterfaces.ts, but you can update this to your dataStore as you integrate the new interfaces we have defined

// NOTE :: TIMERS SHOULD BE STORED AS A SEPERATE ITEM

function checkManeuveringFuel(launchId: number) {
    // a helper function that checks if there is at least 3 units of fuel left

    // TODO - you must complete this helper function

    return false;
}

function canThisLaunchReachTargetDistanceCheck(launchId: number) : boolean {
    // a helper function that does calculations using the launchParameters to see if this launch can go ahead.
    
    // TODO - you must complete this helper function

    return false;
}

// error constant defined becuase it is used frequently
const badActionForStateError = ((action:missionLaunchAction, state: missionLaunchState) => {
    throw HTTPError(400, `invalid action: Cannot do action ${action} in state ${state}`);
});

// helper functions to initialize states
function initializeLaunching(launchId: number) {
    // assumes a valid launchId since this can only be accessed from other functions that have done the check
    // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
    let data = getData();
    let launch: Launch = data.launches.find( (singleLaunch) => singleLaunch.launchId === launchId);

    // TODO - you must complete this helper function
    // Carry out the launch update steps:
    //  1. Set state to LAUNCHING
    //  2. Clear existing timers for this launch
    //  3. Create a timer for 3 seconds to execute initializeManevuring()

    setData(data);
    // You do not need to return anything, you can use this for checks to see if something has gone wrong
    return false;
}

function initializeManeuvering(launchId: number) {
    // assumes a valid launchId since this can only be accessed from other functions that have done the check
    // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
    let data = getData();
    let launch: Launch = data.launches.find( (singleLaunch) => singleLaunch.launchId === launchId);

    // TODO - you must complete this helper function
    // Carry out the launch update steps:
    //  1. Set state to MANEUVERING
    //  2. Clear existing timers for this launch
    //  3. Create a timer for n seconds to execute initializeCoasting() where n is defined in the launchParameters.

    setData(data);

    // You do not need to return anything, you can use this for checks to see if something has gone wrong
    return false;
}

function initializeCoasting(launchId: number) {
    // assumes a valid launchId since this can only be accessed from other functions that have done the check
    // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
    let data = getData();
    let launch: Launch = data.launches.find( (singleLaunch) => singleLaunch.launchId === launchId);

    // TODO - you must complete this helper function
    // Carry out the launch update steps:
    //  1. Set state to COASTING
    //  2. Clear existing timers for this launch

    setData(data);
    // You do not need to return anything, you can use this for checks to see if something has gone wrong
    return false;
}

function initializeMissionComplete(launchId: number) {
    // assumes a valid launchId since this can only be accessed from other functions that have done the check
    // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
    let data = getData();
    let launch: Launch = data.launches.find( (singleLaunch) => singleLaunch.launchId === launchId);

    // TODO - you must complete this helper function
    // Carry out the launch update steps:
    //  1. Set state to MISSION_COMPLETE
    //  2. Clear existing timers for this launch

    setData(data);
    // You do not need to return anything, you can use this for checks to see if something has gone wrong
    return false;
}

function initializeReentry(launchId: number) {
    // assumes a valid launchId since this can only be accessed from other functions that have done the check
    // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
    let data = getData();
    let launch: Launch = data.launches.find( (singleLaunch) => singleLaunch.launchId === launchId);

    // TODO - you must complete this helper function
    // Carry out the launch update steps:
    //  1. Set state to REENTRY
    //  2. Clear existing timers for this launch

    setData(data);
    // You do not need to return anything, you can use this for checks to see if something has gone wrong
    return false;
}

function initializeOnEarth(launchId: number) {
    // assumes a valid launchId since this can only be accessed from other functions that have done the check
    // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
    let data = getData();
    let launch: Launch = data.launches.find( (singleLaunch) => singleLaunch.launchId === launchId);

    // TODO - you must complete this helper function
    // Carry out the launch update steps:
    //  1. Set state to ON_EARTH
    //  2. Clear existing timers for this launch
    //  3. De-allocate astronauts (and launch vehicle)

    setData(data);
    // You do not need to return anything, you can use this for checks to see if something has gone wrong
    return false;
}

function deployPayload(launchId: number) {
    // this function helps deploy the payload
    // assumes a valid launchId since this can only be accessed from other functions that have done the check

    // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
    let data = getData();
    let launch: Launch = data.launches.find( (singleLaunch) => singleLaunch.launchId === launchId);

    // TODO - you must complete this helper function
    // Set the deployed flag of the payload for this launch to true

    setData(data);

} 

// function assumes that controlUserId checks are done and missionId checks are done - i.e. the user exists, the user is logged in, the mission exists and the current user has permission to access this launch (because they own the mission)
export function updateLaunchState(newAction: missionLaunchAction, launchId: number) {
    // check to make sure the launch id exists
    if (!checkLaunchIdValidity(launchId)) {
        throw HTTPError(400, 'invalid launchId');
    }

    // not needed as we have a switch statement that handles this.
    // // check to make sure action exists
    // if (!checkActionValidity(newAction)) {
    //     throw HTTPError(400, `invalid action - ${newAction}`);
    // }

    // big switch statement to check if action is permitted in current state and if it is, what to do
    let data = getData();
    // assumes launch is part the datastore as a property called "launches" which is an array of the Launch type and that it has a property called 'state'
    let launch: Launch = data.launches.find( (singleLaunch) => singleLaunch.launchId === launchId);

    switch(newAction) {
        case missionLaunchAction.LIFTOFF:
            if(launch.state === missionLaunchState.READY_TO_LAUNCH) {
                // this is ok, lets proceed with the actions
                if (!canThisLaunchReachTargetDistanceCheck(launchId)) {
                    // bad launch, abort!
                    updateLaunchState(missionLaunchAction.FAULT, launchId);
                } else {
                    // good launch move to LAUNCHING
                    initializeLaunching(launchId);
                }
            } else {
                badActionForStateError(newAction, launch.state);
            }
            break;
        case missionLaunchAction.SKIP_WAITING:
            if (launch.state === missionLaunchState.LAUNCHING) {
                // this is ok, proceed with actions
                initializeManeuvering(launchId);
            } else {
                badActionForStateError(newAction, launch.state);
            }
            break;
        case missionLaunchAction.CORRECTION:
            if(launch.state === missionLaunchState.MANEUVERING) {
                // this is ok, lets proceed with the actions
                if (!checkManeuveringFuel(launchId)) {
                    // not enough fuel, abort!
                    updateLaunchState(missionLaunchAction.FAULT, launchId);
                } else {
                    // enough fuel, move back to launching
                    initializeLaunching(launchId);
                }
            } else {
                badActionForStateError(newAction, launch.state);
            }
            break;
        case missionLaunchAction.FIRE_THRUSTERS:
            if(launch.state === missionLaunchState.MANEUVERING) {
                // this is ok, lets proceed with the actions
                if (!checkManeuveringFuel(launchId)) {
                    // not enough fuel, abort!
                    updateLaunchState(missionLaunchAction.FAULT, launchId);
                } else {
                    // enough fuel, moving to COASTING
                    initializeCoasting(launchId);
                }
            } else {
                badActionForStateError(newAction, launch.state);
            }
            break;
        case missionLaunchAction.DEPLOY_PAYLOAD:
            if(launch.state === missionLaunchState.COASTING) {
                // this is ok, lets proceed with the actions
                deployPayload(launchId);
                initializeMissionComplete(launchId);
            } else {
                badActionForStateError(newAction, launch.state);
            }
            break; 
        case missionLaunchAction.GO_HOME:
            if(launch.state === missionLaunchState.MISSION_COMPLETE) {
                // this is ok, lets proceed with the actions
                initializeReentry(launchId);
            } else {
                badActionForStateError(newAction, launch.state);
            }
            break;
        case missionLaunchAction.RETURN:
            if(launch.state === missionLaunchState.REENTRY) {
                // this is ok, lets proceed with the actions
                initializeOnEarth(launchId);
            } else {
                badActionForStateError(newAction, launch.state);
            }
            break;
        case missionLaunchAction.FAULT:
            if(launch.state === missionLaunchState.REENTRY || launch.state === missionLaunchState.MISSION_COMPLETE) {
                // this is an unpermitted action in this state.
                badActionForStateError(newAction, launch.state);
            } else if (launch.state === missionLaunchState.READY_TO_LAUNCH){
                initializeOnEarth(launchId);
            } else {
                // this can proceed.
                initializeReentry(launchId);
            }
            break;
        default:
            throw HTTPError(400, `unkown action: ${newAction}`);
    }

}

