#!/bin/bash

# Get the current date and time
current_date=$(date +"%Y-%m-%d %H:%M:%S")

# Use the provided commit message or default to the current date and time
commit_message=${1:-"Deploying changes on $current_date"}

# Add all changes to git
git add .

# Commit changes
git commit -m "$commit_message"

# Push changes to Heroku
git push heroku main
