const secrets = require("docker-secret")

module.exports = {
	...env,
	campus_id: 9,
	api_url: "https://api.intra.42.fr",
	token_endpoint: "/oauth/token",
}
