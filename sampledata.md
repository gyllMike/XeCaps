# Data Model

## Example Data Store State
```javascript
let data = {
    // TODO: insert your data structure example
    // that contains 
    //  a mission control users array 
    //  a space missions array
    missionControlUsersArray: [{
        missionControlUser: {
            controlUserId: 1,
            nameFirst: 'Harry',
            nameLast: 'Potter',
            email: 'harrypotter@gmail.com',
            oldPasswordArray: ['professorpotter007*'],
            newPassword: 'chrislee',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
        }
    }],

    spaceMissionsArray: [{
        spaceMission: {
            controlUserId: 1,
            missionId: 1,
            name: 'Expansion',
            timeCreated: 1683125870,
            timeLastEdited: 1683125871,
            description: "Expand Hogwarts to the space.",
            target: 'Moon',
            isMissionActive: true,
            assignedAstronauts: [{
                astronautId: 1
            }]
        }
    }],

    controlUserSessionsArray: [{
        controlUserSession: {
            controlUserSessionId: 1,
            controlUserId: 2
        }
    }],

    astronautsArray: [{
        astronaut: {
            astronautId: 1,

            timeAdded: 12345678,
            timeLastEdited: 23456789,
            nameFirst: 'Chris',
            nameLast: 'Li',
            rank: 'rank',
            age: 18,
            weight: 60,
            height: 185,
            assignedMission: {
                missionId: 1
            }
        }
    }]
};
```

## Short description of the Data Model

Here you should describe what each property of data model object does. Remember to list the properties of *both* `mission control users` and `space missions`. Do not forget the properties that you can only see from the sample outputs!

|                                            Mission Control User                                             |
|             Property             |  Type  |                           Description                           |
| controlUserId                    | number | The unique id number of a user.                                 |
| nameFirst                        | string | The first name of a user.                                       |
| nameLast                         | string | The last name of a user.                                        |
| email                            | string | The email that the user used to login.                          |
| oldPasswordArray                 | array  | The array contains all old passwords that the user used before. |
| newPassword                      | string | The new password requested by the user.                         |
| numSuccessfulLogins              | number | The number of times the user login successfully.                |
| numFailedPasswordsSinceLastLogin | number | The number of login failed since last login time.               |


|                                     Space Mission                                     |
|     Property      |  Type   |                       Description                       |
| controlUserId     | number  | The unique id number of a user.                         |
| missionId         | number  | The unique id number of a mission.                      |
| name              | string  | The name of the mission.                                |
| timeCreated       | number  | The created time of the mission.                        |
| timeLastEdited    | number  | The last edited time of the mission.                    |
| description       | string  | The description of the mission.                         |
| target            | string  | The target of the mission.                              |
| isMissionActive   | boolean | The status of the mission.                              |
| assignedAstronaut | array   | An array of assigned astronauts containing astronautId. |

|                        Control User Session                        |
|       Property       |  Type  |            Description             |
| controlUserSessionId | number | The unique id number of a session. |
| controlUserId        | number | The unique id number of a user.    |

|                                               Astronaut                                               |
|    Property     |  Type  |                                Description                                 |
| astronautId     | number | The unique id number of an astronaut.                                      |
| timeAdded       | number | The added time of the astronaut.                                           |
| timeLastEdited  | number | The last edit time of the astronaut's detail.                              |
| nameFirst       | string | The first name of the astronaut.                                           |
| nameLast        | string | The last name of the astronaut.                                            |
| rank            | string | The rank of the astronaut.                                                 |
| age             | number | The age of the astronaut.                                                  |
| weight          | number | The weight of the astronaut.                                               |
| height          | number | The height of the astronaut.                                               |
| assignedMission | array  | The assigned mission of the astronaut containing missionId.                |