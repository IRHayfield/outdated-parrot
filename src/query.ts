import { Octokit } from '@octokit/action'

import { PullRequestComments, PullRequestCommentGroup } from './interfaces'

export async function getCommentGroups(
  owner: string,
  repo: string,
  pullRequest: number
): Promise<PullRequestCommentGroup[]> {
  const octokit = new Octokit()

  const query = `query pullRequests($owner: String!, $repo: String!, $pullRequest: Int!) {
          repository(owner: $owner, name: $repo) {
              pullRequest(number: $pullRequest) {
                  reviewThreads(first: 100) {
                      edges {
                          node {
                              isResolved
                              isOutdated
                              comments(first: 100) {
                                  totalCount
                                  nodes {
                                      author {
                                          login
                                          name
                                      }
                                      body
                                      originalLine
                                      path
                                      originalCommit {
                                          abbreviatedOid
                                          oid
                                      }
                                      url
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }`

  const pullRequests: PullRequestComments = await octokit.graphql({
    query,
    owner,
    repo,
    pullRequest
  })

  return pullRequests.repository.pullRequest.reviewThreads.edges
}
