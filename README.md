![](./images/gentlemanparrot.gif)

# Outdated Parrot

GitHub action to add all open outdated comment threads to a pull requests files changed view as annotations.  

## Setup guide

Copy the [parrot.yml](./parrot.yml) file in the root of this repo into your repositories '.github/workflows' directory.

## Inputs

### add-diff

Add diff link to the comment annotation so users can easily navigate to the most relevant diff.  
Following the link leads to the a diff between the commit that the comment was made against and the latest commit.  
Following the link also highlights the original line.  
This link works best using the split view.  

default: true

### add-discussion

Add discussion link to the comment annotation to allow users to quickly navigate to the relevant conversation to close or comment.  

default: true

### add-hash

Add the hash of the git commit which the comment was made against to the comment annotation.  

default: false

### add-regenerate

Add a link to the most recent outdated-parrot workflow run for the pull request to the comment annotation.  
This link allows the quickly rerun the workflow to regenerate annotations if some conversataions have been updated or closed.  

default: false

### add-standalone-regenerate

Add a link to the most recent outdated-parrot workflow run for the pull request to a standalone annotation on the parrot.yml file.  
This link allows the quickly rerun the workflow to regenerate annotations if some conversataions have been updated or closed.  

This location for the link is default as unless the parrot.yml file is changed it is convinently placed at the bottom of the page.  
Adding the link in only one location also allows for shorter annotations making them more readable.  

default: true

### get-latest-line

Find the current line number that the comment was made against using git blame and add the conversation annotation to the current line number.   
If this is set to false then the annotation will be made against the original line number eventhough the relevant line may have moved in the file.  

default: true

## Limitations

### Annotations lack styling options

### Annotations cannot be added to the left side of a split view

### Conversations cannot be moved from the outdated state
