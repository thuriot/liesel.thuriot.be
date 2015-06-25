#!/bin/bash

rev=$(git rev-parse --short HEAD)

cd _site

git init
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

git remote add upstream "https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG.git"

git fetch upstream && git reset upstream/gh-pages

# echo "steven.thuriot.be" > CNAME


touch .


git add -A .


git commit -m "TravisCI: Rebuild pages at ${rev} - Build #$TRAVIS_BUILD_NUMBER"


git push -q upstream HEAD:gh-pages
