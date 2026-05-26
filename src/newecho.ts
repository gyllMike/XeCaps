// // Do not delete this file, this function is used to test server response.

type ErrorMsg = {
    error: string;
  };

function echo(value: string): { value: string } | ErrorMsg {
  if (value === 'echo') {
    return { error: 'You cannot echo the word echo itself' };
  }
  return {
    value,
  };
}

export { echo };
