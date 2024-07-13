import { getMessage } from '../src/parrot'
import { PullRequestCommentGroup } from '../src/interfaces'

// Mock context and other dependencies
const context = {
  issue: {
    number: 123
  },
  runId: '456',
  serverUrl: 'https://github.com/',
  repo: {
    owner: 'your',
    repo: 'repo'
  }
}

jest.mock('@actions/github', () => ({
  context
}))

jest.mock('@actions/core', () => ({
  getBooleanInput: (inputName: string) => {
    const inputs: { [key: string]: boolean } = {
      'add-hash': true,
      'add-diff': true,
      'add-discussion': true,
      'add-regenerate': true
    }
    return inputs[inputName]
  },
  sha256: async (path: string) => `${path}-mockedSha256Hash`
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
                name: 'Author1',
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
                name: 'Author2',
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

    expect(title).toBe('Author1: This is the first comment.')
    expect(message).toBe(
      '@author2: This is the second comment.\n' +
        '---\n' +
        'commit - abc123' +
        'diff - https://github.com/your/repo/pull/123/files/abc123..HEAD#diff-mockedSha256HashL42\n' +
        'disscussion - https://github.com/your/repo/pull/123#discussion_r456\n' +
        'regenerate - https://github.com/your/repo/actions/runs/456'
    )
  })
})
