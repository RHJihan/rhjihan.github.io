---
title: How can I undo the last commit?
tags: [Version Control, Git]
style: border
color: primary
comments: true
description: Learn how to safely undo your last Git commit. This guide explains when to amend, reset while keeping changes, or completely discard a commit.
---

It is a common occurrence in software development to make a commit and subsequently recognize that something is incorrect. In some cases, the commit message may contain an error or lack clarity. In other cases, certain files may have been omitted inadvertently. There are also situations where the commit itself is unnecessary or inappropriate for the repository’s history.  

Such scenarios often lead to the question: *How can this commit be corrected or removed without disrupting the integrity of the project?*  

Fortunately, Git provides several mechanisms to address these situations in a controlled and reliable manner. This article outlines the primary options available for undoing the most recent commit, ranging from simple adjustments to complete removal.


![](https://www.git-tower.com/learn/media/pages/git/faq/undo-last-commit/15afbcad2b-1751996088/02-reset-concept.png)

---

## Option 1: Editing the Last Commit with `--amend`

Before we bring out the heavy tools, ask yourself: do you just want to **edit the last commit**?  

If so, the `--amend` flag is your friend. It lets you:

- Fix or update the commit message  
- Add more changes to the most recent commit  

```bash
git commit --amend
```

## Option 2: Undoing the Last Commit with `git reset`
If you really need to remove the last commit, Git’s reset command is the best approach.
### Keep the changes (soft reset)

```bash
git reset --soft HEAD~1
```

This rewinds your branch to the commit just before the last one. The changes from that commit will remain in your working directory as uncommitted modifications, so you can adjust and recommit them.

### Discard the changes (hard reset)
If you don’t want to keep those changes at all, use:

```bash
git reset --hard HEAD~1
```
**Warning:** This will permanently discard the last commit and its changes. Only use this if you’re absolutely sure you don’t need them anymore.
