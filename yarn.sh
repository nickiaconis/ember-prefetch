#!/bin/bash

echo "Checking if yarn.lock should be regenerated..."
if [[ $TRAVIS_PULL_REQUEST_BRANCH != *"greenkeeper"* ]]; then
	echo "Not a GreenKeeper pull request; skipping lock file regeneration."
	exit 0
fi
if [[ $EMBER_TRY_SCENARIO != "ember-release" ]]; then
	echo "Lock file regeneration limited to EMBER_TRY_SCENARIO=\"ember-release\" to avoid race conditions; skipping."
	exit 0
fi

echo "Cloning $TRAVIS_REPO_SLUG..."
git clone "https://"$PUSH_TOKEN"@github.com/"$TRAVIS_REPO_SLUG".git" yarn-lock-clone
cd yarn-lock-clone

echo "Switching to branch $TRAVIS_PULL_REQUEST_BRANCH..."
git checkout $TRAVIS_PULL_REQUEST_BRANCH

echo "Checking if commit message includes \"update\"..."
if ! git log --name-status HEAD^..HEAD | grep "update"; then
  echo "Latest commit is not a version update; skipping lock file regeneration."
  exit 0
fi

echo "Regenerating lockfile..."
yarn

echo "Configuring git settings in preparation to commit and push..."
git config --global user.email "$PUSH_EMAIL"
git config --global user.name "Travis CI"
git config --global push.default simple

echo "Creating commit..."
git add yarn.lock
git commit -m "chore: regenerate yarn.lock"

echo "Pushing commit..."
git push

echo "Lock file regeneration complete."
