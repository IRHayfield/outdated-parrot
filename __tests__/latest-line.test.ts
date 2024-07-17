import { getLatestLine } from '../src/latest-line'
import { exec, getExecOutput } from '@actions/exec'
import { join } from 'path'
import { mkdirSync, rmSync, writeFileSync } from 'fs'

// Set directory, file names and content
const baseDir = __dirname
const testDir = join(baseDir, 'testDir')
const repoPath = join(testDir, 'gitRepo')
const testFileName = 'testFile.txt'
const originalLine = 5
const originalFileContent = `Test line 1
Test line 2
Test line 3
Test line 4
Test line 5`

describe('getLatestLine', () => {
  // let stdoutWriteSpy: jest.SpyInstance
  let originalCommitHash: string

  beforeEach(async () => {
    // Mock process.stdout.write
    //stdoutWriteSpy = jest
    //  .spyOn(process.stdout, 'write')
    //  .mockImplementation(() => true)

    // Create a temporary test directory
    mkdirSync(testDir)

    // Create Git repository
    await exec(`git init ${repoPath}`)

    // Navigate into repo so getLatestLine git commands run in the correct repo
    process.chdir(repoPath)

    // Create test file
    writeFileSync(join(repoPath, testFileName), originalFileContent)

    // Add and commit test file
    await exec(`git add .`)
    await exec(`git commit -m "Initial commit"`)

    // Get original commit hash
    const gitRevParseOutput = await getExecOutput(`git rev-parse HEAD`)
    originalCommitHash = gitRevParseOutput.stdout.trim()
  })

  afterEach(() => {
    // Restore process.stdout.write mock
    //stdoutWriteSpy.mockRestore()

    // Return to base dir
    process.chdir(baseDir)

    // Remove the temporary test directory
    rmSync(testDir, { recursive: true })
  })

  it('returns the correct new line when lines are added before a line', async () => {
    // Add further commits
    const additionalLines = `New line 1
New line 2
`

    writeFileSync(
      join(repoPath, testFileName),
      additionalLines + originalFileContent
    )
    await exec(`git add .`)
    await exec(`git commit -m "Further commit`)

    // Get new line number
    const newLineNumber = await getLatestLine(
      originalCommitHash,
      testFileName,
      originalLine
    )

    // Check new line number is correct
    expect(newLineNumber).toEqual(7)
  })

  it('returns the correct new line when lines are added after a line', async () => {
    // Add further commits
    const additionalLines = `New line 1
New line 2
`

    writeFileSync(
      join(repoPath, testFileName),
      originalFileContent + additionalLines
    )
    await exec(`git add .`)
    await exec(`git commit -m "Further commit`)

    // Get new line number
    const newLineNumber = await getLatestLine(
      originalCommitHash,
      testFileName,
      originalLine
    )

    // Check new line number is correct
    expect(newLineNumber).toEqual(5)
  })

  it('returns the correct new line when lines are removed before a line', async () => {
    // Add further commits
    writeFileSync(
      join(repoPath, testFileName),
      originalFileContent.substring(originalFileContent.indexOf('\n') + 1)
    )
    await exec(`git add .`)
    await exec(`git commit -m "Further commit`)

    // Get new line number
    const newLineNumber = await getLatestLine(
      originalCommitHash,
      testFileName,
      originalLine
    )

    // Check new line number is correct
    expect(newLineNumber).toEqual(4)
  })

  it('returns the original line number when a line is removed', async () => {
    // Add further commits
    writeFileSync(
      join(repoPath, testFileName),
      originalFileContent.substring(originalFileContent.indexOf('\n') + 1, -1)
    )
    await exec(`git add .`)
    await exec(`git commit -m "Further commit`)

    // Get new line number
    const newLineNumber = await getLatestLine(
      originalCommitHash,
      testFileName,
      originalLine
    )

    // Check new line number is correct
    expect(newLineNumber).toEqual(5)
  })

  it('returns the correct line number after multiple commits', async () => {
    // Add commit with additional lines at start of file
    const firstCommitContent = `Before line 1
Before line 2
${originalFileContent}`

    writeFileSync(join(repoPath, testFileName), firstCommitContent)
    await exec(`git add .`)
    await exec(`git commit -m "Add additional lines at start of file`)

    // Add commit removing lines at start of file
    const secondCommitContent = firstCommitContent.substring(
      firstCommitContent.indexOf('\n') + 1
    )

    writeFileSync(join(repoPath, testFileName), secondCommitContent)
    await exec(`git add .`)
    await exec(`git commit -m "Remove lines at start of file`)

    // Add commit with additional lines at end of file
    const thirdCommitContent = `${secondCommitContent}
After line 1
After line 2`

    writeFileSync(join(repoPath, testFileName), thirdCommitContent)
    await exec(`git add .`)
    await exec(`git commit -m "Add additional lines at end of file`)

    // Get new line number
    const newLineNumber = await getLatestLine(
      originalCommitHash,
      testFileName,
      originalLine
    )

    // Check new line number is correct
    expect(newLineNumber).toEqual(6)
  })
})
