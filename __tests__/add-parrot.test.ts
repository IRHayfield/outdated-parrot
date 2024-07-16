import { addParrot } from '../src/parrot'
import { PullRequestCommentGroup } from '../src/interfaces'
import { EOL } from 'os'

// Mock get boolean input
jest.mock('@actions/core', () => {
  // Use the actual implementation for the rest of the module
  const originalModule = jest.requireActual('@actions/core')

  // Return the original module along with the mocked function
  return {
    __esModule: true, // Indicates that the mock module is an ES module
    ...originalModule,
    getBooleanInput: jest.fn().mockImplementation((inputName: string) => {
      const inputs: { [key: string]: boolean } = {
        'add-hash': true,
        'add-diff': true,
        'add-discussion': true,
        'add-regenerate': true
      }
      return inputs[inputName]
    })
  }
})

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

describe('addParrot', () => {
  it('should add the correct message to stdout', async () => {
    // Mock console log
    const stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true)

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

    await addParrot(commentGroup)

    expect(stdoutSpy).toHaveBeenCalled()
    expect(stdoutSpy).toHaveBeenCalledWith(
      `::notice title=author1%3A This is the first comment.,file=file/path,line=42::@author2: This is the second comment.%0A---%0Acommit - abc123diff - https://github.com/your/repo/pull/123/files/abc123..HEAD#diff-2c651867cb4c3d87273402eb651092abb375910ba05878259bffd1cec9df9209L42%0Adisscussion - https://github.com/your/repo/pull/123#discussion_r456%0Aregenerate - https://github.com/your/repo/actions/runs/456${EOL}`
    )
  })
})
