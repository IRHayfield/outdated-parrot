# Outdated Parrot

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/IRHayfield/outdated-parrot/actions/workflows/linter.yml?query=branch%3Amain)
[![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)](https://github.com/IRHayfield/outdated-parrot/actions/workflows/ci.yml?query=branch%3Amain)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/IRHayfield/outdated-parrot/actions/workflows/check-dist.yml?query=branch%3Amain)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/IRHayfield/outdated-parrot/actions/workflows/codeql-analysis.yml?query=branch%3Amain)
![Coverage](./badges/coverage.svg)

GitHub Action to add all open outdated comment threads to a pull requests files
changed view as annotations.

[![gentleman parrot](./images/gentlemanparrot.gif)](https://cultofthepartyparrot.com/)

## Setup guide

Copy the [parrot.yml](./parrot.yml) file in the root of this repository into
your repositories '.github/workflows' directory.

## Usage

```yaml
- uses: irhayfield/outdated-parrot@v1
  with:
    # Add diff link to the comment annotation so users can easily navigate to the
    # most relevant diff.
    # Following the link leads to the a diff between the commit that the comment
    # was made against and the latest commit.
    # Following the link also highlights the original line.
    # This link works best using the split view.
    # Default: true
    add-diff: ''

    # Add discussion link to the comment annotation to allow users to quickly navigate
    # to the relevant conversation to close or comment.
    # Default: true
    add-discussion: ''

    # Add the hash of the Git commit which the comment was made against to the comment
    # annotation.
    # Default: false
    add-hash: ''

    # Add a link to the most recent outdated-parrot workflow run for the pull request
    # to the comment annotation.
    # This link allows the quickly rerun the workflow to regenerate annotations if
    # some conversataions have been updated or closed.
    # Default: false
    add-regenerate: ''

    # Add a link to the most recent outdated-parrot workflow run for the pull request
    # to a standalone annotation on the parrot.yml file.
    # This link allows the quickly rerun the workflow to regenerate annotations if
    # some conversataions have been updated or closed.
    #
    # This location for the link is default as unless the parrot.yml file is changed
    # it is convinently placed at the bottom of the page.
    # Adding the link in only one location also allows for shorter annotations making
    # them more readable.
    # Default: true
    add-standalone-regenerate: ''

    # Find the current line number that the comment was made against using Git blame
    # and add the conversation annotation to the current line number.
    # If this is set to false then the annotation will be made against the original
    # line number eventhough the relevant line may have moved in the file.
    # Default: true
    get-latest-line: ''
```

## Limitations

### Annotations lack styling options

### Annotations cannot be added to the left side of a split view

### Conversations cannot be moved from the outdated state
