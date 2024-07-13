import { debug } from '@actions/core'
import { getExecOutput } from '@actions/exec'

export async function getLatestLine(
  commitHash: string,
  file: string,
  originalLine: number
): Promise<number> {
  debug(
    `Finding new line number for:\ncommit - ${commitHash}\nfile - ${file}\nline - ${originalLine}`
  )

  let latestLineNumber = originalLine

  const execOtions = { silent: true }

  /**
   * Get list of all revs that blame should ignore when finding the new line number
   * This finds all commits since the one that the comment was made against
   * When git blame ignores those commits the line shows as created by the original commit hash
   * This is then used to find the line in the blame output
   */
  const revListOutput = await getExecOutput(
    `git rev-list ${commitHash}..HEAD`,
    [],
    execOtions
  )

  debug(`git rev-list stdout:\n${revListOutput.stdout}`)
  debug(`git rev-list stderr:\n${revListOutput.stderr}`)

  const revsToIgnore = revListOutput.split('\n').filter(String)

  // Generate a string of --ignore-rev options from revsToIgnore
  let ignoreRevOptions = ''
  if (revsToIgnore[0]) {
    ignoreRevOptions = `--ignore-rev ${revsToIgnore.join(' --ignore-rev ')}`
  }

  // Get full git blame for the file and turn it into an array
  const gitBlameOutput = await getExecOutput(
    `git blame ${ignoreRevOptions} --porcelain ${file}`,
    [],
    execOtions
  )

  debug(`git blame stdout:\n${gitBlameOutput.stdout}`)
  debug(`git blame stderr:\n${gitBlameOutput.stderr}`)

  const blameLineArray = gitBlameOutput.stdout.split('\n')

  // Search blame array for the first string starting with the commit hash and original line number
  const latestLine = blameLineArray.filter(str =>
    str.startsWith(`${commitHash} ${originalLine} `)
  )[0]

  /**
   * If a latest line is found then set the latest line number to the third entry on that line
   * This entry is the new line number for that line
   */

  if (latestLine) {
    latestLineNumber = parseInt(latestLine.split(' ')[2])
  }

  return latestLineNumber
}
