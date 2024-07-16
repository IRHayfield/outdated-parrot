import { getMessage } from '../src/parrot'
import { PullRequestCommentGroup } from '../src/interfaces'

// Mock get boolean input
jest.mock('@actions/core', () => ({
  getBooleanInput: (inputName: string) => {
    const inputs: { [key: string]: boolean } = {
      'add-hash': true,
      'add-diff': true,
      'add-discussion': true,
      'add-regenerate': true
    }
    return inputs[inputName]
  }
}))

// Mock github context
jest.mock('@actions/github', () => ({
  context: {
    issue: {
      number: 123
    },
    runId: '456',
    serverUrl: 'https://github.com',
    repo: {
      owner: 'your',
      repo: 'repo'
    }
  }
}))

describe('getMessage', () => {
  it('should return the correct title and message', async () => {
    const commentGroup: PullRequestCommentGroup = {
      node: {
        isResolved: false,
        isOutdated: true,
        comments: {
          totalCount: 2,
          nodes: [
            {
              author: {
                login: 'author1'
              },
              body: 'This is the first comment.',
              originalLine: 42,
              originalCommit: {
                abbreviatedOid: 'abc123',
                oid: 'abc123'
              },
              path: 'file/path',
              url: 'https://github.com/your/repo/pull/123#discussion_r456'
            },
            {
              author: {
                login: 'author2'
              },
              body: 'This is the second comment.',
              originalLine: 42,
              originalCommit: {
                abbreviatedOid: 'abc123',
                oid: 'abc123'
              },
              path: 'file/path',
              url: 'https://github.com/your/repo/pull/123#discussion_r456'
            }
          ]
        }
      }
    }

    const originalComment = commentGroup.node.comments.nodes[0]

    const [title, message] = await getMessage(commentGroup, originalComment)

    expect(title).toBe('author1: This is the first comment.')
    expect(message).toBe(
      '@author2: This is the second comment.\n' +
        '---\n' +
        'commit - abc123' +
        'diff - https://github.com/your/repo/pull/123/files/abc123..HEAD#diff-2c651867cb4c3d87273402eb651092abb375910ba05878259bffd1cec9df9209L42\n' +
        'disscussion - https://github.com/your/repo/pull/123#discussion_r456\n' +
        'regenerate - https://github.com/your/repo/actions/runs/456'
    )
  })
})
