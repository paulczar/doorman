
var hostname = process.env.HOSTNAME || 'http://example.com'
var proxy_host = process.env.PROXY_HOST || 'localhost'
var proxy_port = process.env.PROXY_PORT || 8080
var session_secret = process.env.SESSION_SECRET || 'AeV8Thaieel0Oor6shainu6OUfoh3ohwZaemohC0Ahn3guowieth2eiCkohhohG4'

var appId = process.env.APP_ID
var appSecret = process.env.APP_SECRET
var requiredOrganization = process.env.GITHUB_ORG

module.exports = {
  // port to listen on
  port: 8888,
  hostname: hostname,

  proxyTo: {
    host: proxy_host,
    port: proxy_port
  },

  sessionSecret: session_secret, // change me
  sessionCookieMaxAge: 60 * 60 * 4 * 1000, // milliseconds until session cookie expires (or "false" to not expire)

  modules: {
    // Register a new oauth app on Github at
    // https://github.com/account/applications/new
    github: {
      appId: appId,
      appSecret: appSecret,
      entryPath: '/oauth/github',
      callbackPath: '/oauth/github/callback',
      requiredOrganization: requiredOrganization // short organization name
    }
  }
};
