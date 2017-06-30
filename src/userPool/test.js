/* eslint-env browser */
const AWSCognito = require('amazon-cognito-identity-js')

const UserPool = new AWSCognito.CognitoUserPool({
  UserPoolId: 'eu-west-1_Csei8EELA',
  ClientId: '4evpd38as6e8jp4cusb633vlrn'
})

function signUp(username, password, userAttributes = []) {
  console.log(`SignUp in with ${username}:${password} and following attibutes`, userAttributes)
  return new Promise((resolve, reject) => {
    UserPool.signUp(username, password, userAttributes, null, (err, result) => {
      if (err) {
        return reject(err)
      }

      const cognitoUser = result.user
      console.log(`user name is ${cognitoUser.getUsername()}`)
      return resolve(cognitoUser)
    })
  })
}

function confirmRegistration(evt) {
  evt.preventDefault()
  const username = document.querySelector('input[name=username-confirm]').value
  const code = document.querySelector('input[name=code]').value
  const cognitoUser = new AWSCognito.CognitoUser({
    Username: username,
    Pool: UserPool
  })

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        return reject(err)
      }
      console.log(`call result: ${result}`)
      return resolve(result)
    })
  })
}

function signIn(username, password) {
  console.log(`SignIn in with ${username}:${password}`)
  const authenticationDetails = new AWSCognito.AuthenticationDetails({
    Username: username,
    Password: password
  })
  const cognitoUser = new AWSCognito.CognitoUser({
    Username: username,
    Pool: UserPool
  })

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: resolve,
      onFailure: reject
    })
  })
}

function submitLogin(evt) {
  evt.preventDefault()

  const username = document.querySelector('input[name=username]').value
  const password = document.querySelector('input[name=password]').value
  const email = new AWSCognito.CognitoUserAttribute({
    Name: 'email',
    Value: document.querySelector('input[name=email]').value
  })

  // signUp(username, password, [email]).then(res => console.log(res))
  signIn(username, password).then((res) => {
    const jwtToken = res.getIdToken().getJwtToken()
    console.log('Token:', jwtToken)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form')
  loginForm.addEventListener('submit', submitLogin)

  const confirmBtn = document.querySelector('.js-confirm')
  confirmBtn.addEventListener('click', confirmRegistration)
})
