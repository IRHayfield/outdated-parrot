export interface PullRequestComments {
  repository: {
    pullRequest: {
      reviewThreads: {
        edges: PullRequestCommentGroup[]
      }
    }
  }
}

export interface PullRequestCommentGroup {
  node: {
    isResolved: boolean
    isOutdated: boolean
    comments: {
      totalCount: number
      nodes: Comment[]
    }
  }
}

export interface Comment {
  author: {
    login: string
  }
  body: string
  originalLine: number
  originalCommit: {
    abbreviatedOid: string
    oid: string
  }
  path: string
  url: string
}
