const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput("who-to-greet");
    // const orgName = core.getInput("ORGANIZATION");
    // const projectNumber = core.getInput("PROJECT_NUMBER");

    // const myToken = core.getInput("GITHUB_TOKEN");

    const nameToGreet = "Yuri";
    const orgName = "TestingOrganizationForAutomation";
    const projectNumber = "1";

    const myToken = "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";
    const octokit = github.getOctokit(myToken);

    const projectQuery = `
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
    const projectResult = await octokit.graphql(projectQuery, {
      org: orgName,
      number: parseInt(projectNumber),
    });
    console.log(projectResult);

    PROJECT_ID = projectResult.organization.projectNext.id;
    STATUS_FIELD_ID = projectResult.organization.projectNext.fields.nodes.find(
      (o) => o.name === "Status"
    ).id;
    TODO_OPTION_ID = JSON.parse(
      projectResult.organization.projectNext.fields.nodes.find(
        (o) => o.name === "Status"
      ).settings
    ).options.find((o) => o.name === "In Progress").id;
    PROJECT_CARDS = projectResult.organization.projectNext.items.nodes;
    console.log(PROJECT_ID);
    console.log(STATUS_FIELD_ID);
    console.log(TODO_OPTION_ID);
    console.log(PROJECT_CARDS);

    console.log("PR");
    const pullRequestId = core.getInput("PR_ID");
    console.log(pullRequestId);
    console.log("PR");

    // const issuesQuery = `
    // query($pr: ID!) {
    //   node(id: $pr) {
    //     ... on PullRequest {
    //       timelineItems(itemTypes: [CONNECTED_EVENT, DISCONNECTED_EVENT], first: 100) {
    //         nodes {
    //           ... on ConnectedEvent {
    //             id
    //             subject {
    //               ... on Issue {
    //                 id
    //                 number
    //                 url
    //                 title
    //               }
    //             }
    //           }
    //           ... on DisconnectedEvent {
    //             id
    //             subject {
    //               ... on Issue {
    //                 title
    //                 number
    //                 url
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }`

    // const issuesResult = await octokit.graphql(issuesQuery, {
    //   org: orgName,
    //   number: parseInt(projectNumber),
    // });

    // const resource = issuesResult.data.data.resource
    // const issues = {}
    // resource.timelineItems.nodes.map((node) => {
    //   if (issues.hasOwnProperty(node.subject.number)) {
    //     issues[node.subject.number]++
    //   } else {
    //     issues[node.subject.number] = 1
    //   }
    // })
    // const linkedIssues = []
    // for (const [issue, count] of Object.entries(issues)) {
    //   if (count % 2 !== 0) {
    //     linkedIssues.push(issue)
    //   }
    // }
    // console.log(issues)

    // console.log(linkedIssues)
    console.log(`Hello ${nameToGreet}!`);
    const time = new Date().toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
