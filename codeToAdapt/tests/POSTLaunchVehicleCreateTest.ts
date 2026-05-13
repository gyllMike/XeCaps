// checks all the values for 400 errors ::
// Name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
// Name is less than 2 characters or more than 20 characters
// Description contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
// Description is less than 2 characters or more than 50 characters
// maximumCrewWeight < 100 or > 1000
// maximumPayloadWeight < 100 or > 1000
// launchVehicleWeight < 1000 or > 100000
// thrustCapacity < 100000 or > 10000000
// maneuveringFuel < 10 or > 100

// checks for 401 errors::
// controlUserSessionId is not valid or is empty

// Test Structure

// setup (beforeEach)
//  use clearRequest to reset the dataStore  
//  use adminAuthRegisterRequest to create a user
//  use that controlUserSessionId to manage the rest of our tests

// additional functions
//  use GET LaunchVehicleInfo to test if our datastore has been modified

// Success tests
//  1. check valid output with valid input expect(launchVehicleId).toEqual(expect.any(Number))
//  2. datastore modification check - use GET LaunchVehicleInfo to help with this

// Error tests
// at least 1 for each of the conditions in the swagger
// make sure to check for the appropriate status code in the error 