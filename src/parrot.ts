import { notice, getBooleanInput } from '@actions/core'
import { context } from '@actions/github'
import { Octokit } from '@octokit/action'

import { getLatestLine } from './latest-line'
import { sha256 } from './hash'
import {
  PullRequestComments,
  PullRequestCommentGroup,
  Comment
} from './interfaces'

const octokit = new Octokit()

const repoUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}`

export async function addParrot(
  commentGroup: PullRequestCommentGroup
): Promise<void> {
  const originalComment: Comment = commentGroup.node.comments.nodes[0]

  // Get title and message for the annotation
  const [title, message] = await getMessage(commentGroup, originalComment)

  let latestLineNumber = originalComment.originalLine

  if (getBooleanInput('get-latest-line')) {
    // Get latest file line number using git
    // So that the annotation will be added to the correct line
    latestLineNumber = await getLatestLine(
      originalComment.originalCommit.oid,
      originalComment.path,
      originalComment.originalLine
    )
  }

  const annotationProperties = {
    file: originalComment.path,
    startLine: latestLineNumber,
    title
  }

  notice(message, annotationProperties)
}

export async function getMessage(
  commentGroup: PullRequestCommentGroup,
  originalComment: Comment
): Promise<[string, string]> {
  let title = ''
  let message = ''

  // Populate title and message with all the comments in the thread
  for (const comment of commentGroup.node.comments.nodes) {
    const authorName: string = comment.author.name
    const authorLogin: string = comment.author.login
    const body: string = comment.body

    // First comment is added as the annotation title to save space
    if (!title) {
      title = `${authorName}: ${body}`
    } else {
      // Use @ author login as rollover infomation is available in annotation body
      message += `@${authorLogin}: ${body}\n`
    }
  }

  // Add delimitation between discussion and links if message contains comments
  if (message) {
    message += `---\n`
  }

  if (getBooleanInput('add-hash')) {
    message += `commit - ${originalComment.originalCommit.abbreviatedOid}`
  }

  if (getBooleanInput('add-diff')) {
    const pullRequestUrl = `${repoUrl}/pull/${context.issue.number}`

    // In pull requests changed files view, file url references are a SHA256 of the relative file path
    // I assume that if file names change the reference becomes the SHA256 of the two file paths
    // The following lines will not correctly handle this case
    // the link will work but it will not highlight a line
    const pathSha256 = await sha256(originalComment.path)

    const diffUrl = `${pullRequestUrl}/files/${originalComment.originalCommit.abbreviatedOid}..HEAD#diff-${pathSha256}L${originalComment.originalLine}`
    message += `diff - ${diffUrl}\n`
  }

  if (getBooleanInput('add-discussion')) {
    message += `disscussion - ${originalComment.url}\n`
  }

  if (getBooleanInput('add-regenerate')) {
    // Add link to the latest parrot run so users can easily regenerate annotations
    const runUrl = `${repoUrl}/actions/runs/${context.runId}`
    message += `regenerate - ${runUrl}`
  }

  return [title, message]
}

export async function addRegenerateParrotsLink(
  file: string,
  startLine: number
): Promise<void> {
  const title = 'To regenerate annotations please rerun this build'

  const message = `${repoUrl}/actions/runs/${context.runId}`

  const annotationProperties = {
    file,
    startLine,
    title
  }

  notice(message, annotationProperties)
}

export async function parrotOutdatedOpenComments(
  owner: string,
  repo: string,
  pullRequest: number
): Promise<boolean> {
  /**
   * Gets a list of pull request comments
   * Filters out only those that are both unresolved and outdated
   * then adds them as annotations to the pull request code review
   */

  let atleastOneParrotExists = false

  // Get a list of all pull request comments
  const commentGroups = await getCommentGroups(owner, repo, pullRequest)

  for (const commentGroup of commentGroups) {
    // Check if comment is outdated
    if (commentGroup.node.isOutdated) {
      // Check comment is not resolved
      if (!commentGroup.node.isResolved) {
        addParrot(commentGroup)
        atleastOneParrotExists = true
      }
    }
  }

  return atleastOneParrotExists
}

export async function getCommentGroups(
  owner: string,
  repo: string,
  pullRequest: number
): Promise<PullRequestCommentGroup[]> {
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
