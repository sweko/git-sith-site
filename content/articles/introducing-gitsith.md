---
title: "Introducing GitSith"
date: "2025-12-17"
description: "A developer-oriented Git power tool for common tasks. Because the dark side has better tools."
---

# Introducing GitSith

Welcome to GitSith — a developer-oriented Git power tool for common tasks. Because the dark side has better tools. ⚔️

GitSith is a .NET global tool that extends Git with powerful commands for everyday workflows. By leveraging Git's subcommand discovery (any `git-<name>` executable in your PATH becomes `git <name>`), GitSith integrates seamlessly into your existing workflow.

## Features

### `git sith ignore`

Easily add `.gitignore` templates to your repository using GitHub's official template collection.

```bash
# Add a single template
git sith ignore node

# Add multiple templates
git sith ignore node python visualstudio

# Use aliases (csharp → Dotnet, js → Node, etc.)
git sith ignore csharp js

# List all available templates
git sith ignore --list

# Show available aliases
git sith ignore --aliases

# Embrace the dark side (ignore everything)
git sith ignore
```

### `git sith force-push` / `git sith push`

Stage all changes, commit with a message, and push to remote in one command. Perfect for quick iterations.

```bash
# Commit with a custom message and push
git sith push "Fixed the bug"

# Let the dark side choose your commit message
git sith push
# Uses random Sith quotes like "Peace is a lie, there is only passion."
```

### `git sith purge` / `git sith order-66`

Remove a file from git history completely — the nuclear option. Rewrites history to eliminate all traces of a file.

```bash
# Purge a file from all history
git sith purge secrets.txt

# Use the Order 66 alias
git sith order-66 passwords.env

# With confirmation prompt
git sith purge secrets.txt --confirm
```

⚠️ **Warning:** This rewrites git history. After purging, you'll need to force push and collaborators will need to re-clone.

### `git sith help`

Show help for git-sith commands. Works around the issue where `git sith --help` is intercepted by Git itself.

```bash
# Show all commands
git sith help

# Show help for a specific command
git sith help ignore
```

## Installation

### From GitHub Releases

Download the latest release from [GitHub Releases](https://github.com/sweko/git-sith-command/releases). Pre-built binaries are available for Windows, Linux, and macOS — just download, extract, and add to your PATH.

### As a .NET Global Tool

```bash
# Install from NuGet (once published)
dotnet tool install --global GitSith

# Or build and install locally
dotnet pack
dotnet tool install --global --add-source ./nupkg GitSith
```

### Build from Source

```bash
dotnet build -c Release

# On Windows:
copy bin\Release\net8.0\git-sith.exe C:\YourPathDirectory\

# On Linux/macOS:
cp bin/Release/net8.0/git-sith /usr/local/bin/
chmod +x /usr/local/bin/git-sith
```

## Requirements

- .NET 8.0 SDK or later
- Git

## Roadmap

Future commands being considered:

- `git sith wip` — Quick WIP commits
- `git sith undo` — Safe undo operations  
- `git sith clean` — Interactive cleanup
- `git sith stats` — Repository statistics
- `git sith alias` — Manage git aliases with Sith flair

## Get Involved

Ideas and contributions are welcome! The project is MIT licensed.

May the Force serve you well. 🌑
