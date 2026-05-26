// This file should contain your functions relating to:
// - clear
import { setData, DataStore } from './dataStore';
import { timers } from './newHelpers';

export function clear (): Record<string, never> {
  const initialdata: DataStore = {
    missionControlUsersArray: [],
    spaceMissionsArray: [],
    controlUserSessionsArray: [],
    astronautsArray: [],
    launchesArray: [],
    payloadsArray: [],
    launchVehiclesArray: []
  };
  timers.forEach((v) => clearTimeout(v));
  timers.clear();
  setData(initialdata);
  return {};
}
