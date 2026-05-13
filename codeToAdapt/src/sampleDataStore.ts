import {
    ControlUser,
    Mission,
    Astronaut,
    Session,
    LaunchVehicle,
    Launch,
    Payload,
    DataModel
} from './newInterfaces'

let data: DataModel = {
    controlUsers: [],
    missions: [],
    sessions: [],
    astronauts: [],
    launchvehicles: [],
    payloads: [],
    launches: []
}

// replace with your getData()
export function getData() : DataModel {
    
    return data;
};

// replace with your setData()
export function setData(newData: DataModel) {
    data = newData;
}