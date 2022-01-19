const core = require("@actions/core");
const github = require("@actions/github");

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput("who-to-greet");
  const orgName = core.jetInput("ORGANIZATION");
  const projectNumber = core.getInput("PROJECT_NUMBER");

  const myToken = core.getInput("token");
  const octokit = github.getOctokit(myToken);

  query = `
  query($org: String!, $number: Int!) {
    organization(login: $org){
      projectNext(number: $number) {
        id
        fields(first:20) {
          nodes {
            id
            name
            settings
          }
        }
        items(last: 100) {
          nodes {
            title
            id
          }
        }
      }
    }
  }`;
  const result = await octokit.graphql(query, {
    org: orgName,
    number: projectNumber,
  });
  console.log(result);

  console.log(`Hello ${nameToGreet}!`);
  const time = new Date().toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
