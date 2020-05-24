/**
 * Check is @param is empty
 * @param string
 * @returns {boolean}
 */
const isEmpty = (string) => {
  return string.trim() === "";
}

/**
 * Check is @param is equal to a email
 * @param email
 * @returns {boolean}
 */
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !!email.match(regEx);
}

/**
 * Validate sign up data
 * @param data
 * @returns {{valid: boolean, errors: {}}}
 */
exports.validateSignupData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = 'Must not be an empty'
  } else if (!isEmail(data.email)) {
    errors.email = 'Must be a valid email adress'
  }

  if (isEmpty(data.password)) {
    errors.password = 'Must not be empty'
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords must be the same'
  }

  if (isEmpty(data.handle)) {
    errors.handle = 'Must not be empty'
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}

/**
 * Validate login data: {
 *   email: String
 *   password: String
 * }
 * @param data
 * @returns {{valid: boolean, errors: {}}}
 */
exports.validateLoginData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = 'Must not be empty'
  }

  if (isEmpty(data.password)) {
    errors.password = 'Must not be empty'
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}