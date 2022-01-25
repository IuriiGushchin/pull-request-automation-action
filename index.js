const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const pullRequestId = core.getInput("PR_ID");
    const branchName = core.getInput("BRANCH_NAME");

    const myToken = core.getInput("GITHUB_TOKEN");
    const octokit = github.getOctokit(myToken);

    const issuesQuery = `
    query($pr: ID!) {
      node(id: $pr) {
        ... on PullRequest {
          timelineItems(itemTypes: [CONNECTED_EVENT, DISCONNECTED_EVENT], first: 100) {
            nodes {
              ... on ConnectedEvent {
                id
                subject {
                  ... on Issue {
                    number
                    title
                  }
                }
              }
              ... on DisconnectedEvent {
                id
                subject {
                  ... on Issue {
                    title
                    number
                  }
                }
              }
            }
          }
          repository {
            name,
            owner {
              login
            }
          }
        }
      }
    }`;

    const issuesResult = await octokit.graphql(issuesQuery, {
      pr: pullRequestId,
    });
    const repoName = issuesResult.node.repository.name;
    const ownerName = issuesResult.node.repository.owner.login;

    const issues = {};
    issuesResult.node.timelineItems.nodes.map((node) => {
      if (issues.hasOwnProperty(node.subject.number)) {
        issues[node.subject.number]++;
      } else {
        issues[node.subject.number] = 1;
      }
    });
    const linkedIssuesNumbers = [];
    for (const [issue, count] of Object.entries(issues)) {
      if (count % 2 !== 0) {
        linkedIssuesNumbers.push(parseInt(issue));
      }
    }

    for (let linkedIssueNumber of linkedIssuesNumbers) {
      var updatedIssueInformation = await octokit.rest.issues.get({
        owner: ownerName,
        repo: repoName,
        issue_number: linkedIssueNumber,
      });
      let labels = updatedIssueInformation.data.labels.map(
        (label) => label.name
      );
      labels.push(branchName === "dev" ? "InDev" : "InTest");

      const result = await octokit.rest.issues.update({
        owner: ownerName,
        repo: repoName,
        issue_number: linkedIssueNumber,
        labels: labels,
      });
      console.log("Edited issue data --- ", result);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
