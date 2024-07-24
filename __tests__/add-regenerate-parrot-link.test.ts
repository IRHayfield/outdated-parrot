import { addRegenerateParrotsLink } from '../src/parrot'
import { EOL } from 'os'

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

    await addRegenerateParrotsLink('file/name', 1)

    expect(stdoutSpy).toHaveBeenCalled()
    expect(stdoutSpy).toHaveBeenCalledWith(
      `::notice title=To regenerate annotations please rerun this build,file=file/name,line=1::https://github.com/your/repo/actions/runs/456${EOL}`
    )
  })
})
