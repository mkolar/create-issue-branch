const nock = require('nock')
const myProbotApp = require('../probot')
const { Probot } = require('probot')
const payload = require('./fixtures/issues.opened')
const issueCreatedBody = { body: 'Thanks for opening this issue!' }

nock.disableNetConnect()

let probot

beforeEach(() => {
  probot = new Probot({})
  // Load our app into probot
  const app = probot.load(myProbotApp)

  // just return a test token
  app.app = () => 'test'
})

test('creates a comment when an issue is opened', async () => {
  // Test that we correctly return a test token
  nock('https://api.github.com')
    .post('/app/installations/2/access_tokens')
    .reply(200, { token: 'test' })

  // Test that a comment is posted
  nock('https://api.github.com')
    .post('/repos/hiimbex/testing-things/issues/1/comments', (body) => {
      expect(body).toMatchObject(issueCreatedBody)
      return true
    })
    .reply(200)

  // Receive a webhook event
  await probot.receive({ name: 'issues', payload })
})

test('get branch name from issue title', () => {
  expect(myProbotApp.getBranchNameFromIssue(1, 'Hello world')).toBe('issue-1-Hello_world')
  expect(myProbotApp.getBranchNameFromIssue(2, 'Test issue...')).toBe('issue-2-Test_issue')
})
