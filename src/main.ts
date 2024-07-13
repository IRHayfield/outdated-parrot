import { debug, setFailed, getBooleanInput } from '@actions/core'
import { context } from '@actions/github'

import { parrotOutdatedOpenComments, addRegenerateParrotsLink } from './parrot'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */

export async function run(): Promise<void> {
  try {
    if (context.eventName === 'pull_request') {
      const owner = context.repo.owner
      const repo = context.repo.repo
      const pullRequest = context.payload.pull_request?.number

      debug(
        `Parroting outdated code comments on pull request ${pullRequest} in ${owner}/${repo}`
      )

      if (pullRequest) {
        const atleastOneParrotExists = await parrotOutdatedOpenComments(
          owner,
          repo,
          pullRequest
        )

        const addStandaloneRegenerateLink =
          atleastOneParrotExists && getBooleanInput('add-standalone-regenerate')

        if (addStandaloneRegenerateLink) {
          await addRegenerateParrotsLink('.github/workflows/parrot.yml', 1)
        }
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) setFailed(error.message)
  }
}
