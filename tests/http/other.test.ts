test('remove me 5', () => {
  expect(1 + 1).toBe(2);
});

// // test for function in other.js
// import { clear } from './other.js';
// import { adminAuthRegister } from './auth.js';
// import { errorCategories } from './testSamples.js';

// describe('clear tests', () => {
//   test('should return an empty object on success', () => {
//     expect(clear()).toStrictEqual({});
//   });

//   test('should allow a user to be re-registered after clearing the state', () => {
//     adminAuthRegister('Zhen@gmail.com', 'StrongAndVa1id', 'Zhen', 'Cao');

//     const result1 = adminAuthRegister('Zhen@gmail.com', 'StrongAndVa1id', 'Zhen', 'Cao');
//     expect(result1).toStrictEqual({
//       error: expect.any(String),
//       errorCategory: errorCategories.BAD_INPUT
//     });
//     //Clear the application state.
//     clear();

//     // Try to register me again
//     // This should now succeed
//     const result2 = adminAuthRegister('Zhen@gmail.com', 'StrongAndVa1id', 'Zhen', 'Cao');
//     expect(result2).toStrictEqual({
//       controlUserId: expect.any(Number),
//     });
//   });
// });
