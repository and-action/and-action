# 🎬 And Action - Monitoring your GitHub Actions Workflows and Deployments

And Action is a webapp to monitor your GitHub Actions available on [https://andaction.dev](https://andaction.dev).
It allows you to keep track of the state of all repositories relevant to you in one single place.

It shows the current state of GitHub Actions workflows for your repositories' main branches.
Furthermore, it shows the commit history of your repositories along with information of deployments.
Additionally, you can trigger GitHub deployments right from the UI.

Please read the [documentation](#documentation) to learn more.


## Documentation

This documentation explains how to use And Action.


### Prerequisites

To run And Action you need a GitHub account to login.
And Action needs the following permissions:

* Organizations and teams: Read-only access
* Repositories: Public and private


### Getting Started

Open your browser and navigate to [https://andaction.dev](https://andaction.dev).

When logging in to And Action for the first time, you will be asked to select repositories that you want to monitor. The list shows all your personal repositories as well as organizations' repositories that you are member of. Use the checkboxes next to the repositories that you want to monitor and click save.

Next, you will be taken to the Actions view containing all selected repositories.
To change the repositories selection, click on the settings button on the right of the toolbar at the top.
On mobile, open the menu via the hamburger button on the right of the toolbar at the top and click on "Settings".

> **Note**  
> Settings are saved in your browser. So they are not synchronized among your devices or different browsers.

Now you are ready to start using the two views of And Action, namely [Actions](#actions) and [Commits & Deployments](#commits--deployments).


### Actions

The Actions view shows one card for every repository. Repositories are grouped by organization and are ordered by repository name. Each card contains the name of its main branch.

A click on the repository name opens the [Commits & Deployments](#commits--deployments) view scrolled to the clicked repository.
A click on the branch name opens a new browser tab navigating to GitHub.

At the bottom of the card you see workflow tags. Each tag is a  workflow configured for the repository's main branch.
A workflow tag is shown if at least one workflow run exists.

The color of the tag and the icon on the right of the tag represent the status of the last workflow run. A click on the tag opens a new browser tab navigating to this workflow run on GitHub.

A tag can have one of the following states:

* Success
* Error
* In progress
* Waiting
* Skipped

To find repositories even quicker, one can use the repository filter in the toolbar. It filters all repositories containing the entered text somewhere in the repository name. The filter is case-insensitive.

#### Configuration options

> **Note**  
> For an in-depth explanation of And Action's configuration, please see [Configuration](#configuration).

Options regarding the Actions view are set below the `actions` property in your `andaction.yml`.

Currently, there is only one option for the Actions view: `excluded-workflows`

##### excluded-workflows

Maybe there are some workflows that you don't want to appear in the Actions view, e.g. workflows that run to do checks on feature branches or workflows that are scheduled and thus always run in the context of the main branch.

To exclude them from the view, you can add a configuration section into your And Action config files.

```yaml
actions:
  excluded-workflows:
    - Manually deploy app
```

The items in the list are the names that you define within that workflow, it is **not** the filename.

So the example above would exclude the following workflow:

```yaml
# manual-deployment.yml
name: Manually deploy app

on: [workflow_dispatch]

jobs:
  job1:
    runs-on: ubuntu-latest
  # ...
```


### Commits & Deployments

The Commits & Deployments view shows one column for every repository. Repositories are grouped by organization and are ordered by repository name. Each repository column contains the name of its main branch.

A click on the repository or the branch name opens a new browser tab navigating to GitHub.

Below the main branch's name you see the commit history of the latest commit in the main branch, i.e. you only see commits that were merged into the main branch at some point. Other open branches are **not** visible here.

To find repositories even quicker, one can use the repository filter in the same way as in the Actions view.


#### Deployments

If a commit was deployed via GitHub's Deployment API, a tag is shown at the commit containing the name of the environment to which it was deployed along with the state of that deployment. The active deployments are shown as well as inactive deployments. Tags for inactive deployments are shown lighter than the active ones. Each environment has its own color. Those have no meaning. They are different so one can distinguish them easily. The icon on the right of the tag represents the status of the deployment.

A tag can have one of the following states:

* Success
* Error
* In progress
* Waiting
* Skipped

If the log url is set for the environment's deployment, the tag is a link to that url.


#### Trigger a Deployment

To trigger a deployment for a commit, you have to click on the deploy button (the rocket on the right of the commit info in the tree view). Using the deploy dialog is only possible if deploy environments are configured.

Let's assume for now that you have configured three environments for deployments, namely `dev`, `test` and `live`.

The deployment dialog shows all three environments together with their state. Deployments can only be triggered for one environment after the other. So in this example, you can deploy a commit to the dev environment first.

If the deployment was successful, you can deploy to `test`. It is also possible to redeploy `dev`.

A deployment to an environment is possible, when:

* Deployments to previous environments are finished successfully.
* There is no deployment in progress for the selected environment, even not for other commits.
* The commit that should be deployed is in a successful state, i.e. GitHub check suites for the default branch that are not contained in the list of [excluded-workflows](#excluded-workflows) are all completed successfully.
* The commit history is the current state. Otherwise, you need to reload the view first.


##### Request to Create a Deployment

When triggering a deployment, And Action calls GitHub's REST API to create a deployment. Thus, a new deployment for the selected environment is created having the state pending.

The post request to create the deployment contains the following properties in the payload:

* `auto_merge`: `false`
* `description`: `"Deployed via And Action"`
* `environment`: The name of the environment the deployment is triggered for, e.g. `dev`, `test` or `live`.
* `payload`: A custom payload containing additional information. Contains property `deployment_type` having one of the values `'forward'`, `'redeploy'` or `'rollback'`.
* `production_environment`: `true` if value for `environment` is one of `'live'` or `'production'`, otherwise `false`
* `ref`: The commit sha


##### The Deployment Workflow

When a deployment is created in GitHub, it starts the GitHub Actions workflow having the trigger `deployment`. This workflow should do the actual deployment and additionally should take care of setting the correct state for the deployment, i.e. at the beginning it should set it to "in progress" and at the end it should set it to "success" or "failure". Furthermore, you should set a `log_url`. If the `log_url` is set for a deployment, And Action will link that to the environment tag within the Commits & Deployments view. Probably, the `log_url` should be set to the workflow run that was triggered by the deployment.

Example for a deployment workflow:
```yaml
# <repository_root>/.github/workflows/deploy.yaml
name: Deploy
on: [deployment]
jobs:
  deploy-heroku:
    runs-on: ubuntu-22.04
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - name: Set deployment state in progress
        run: |
          gh api \
          --method POST \
          -H "Accept: application/vnd.github.v3+json" \
          /repos/${{ github.repository_owner }}/${{ github.event.repository.name }}/deployments/${{ github.event.deployment.id }}/statuses \
          -f environment="${{ github.event.deployment.environment }}" \
          -f state="in_progress" \
          -f log_url="${{ github.event.deployment.url }}" \

      - uses: actions/checkout@v3

      - name: Deploy
        # Do the actual deployment to your server, e.g. AWS, Heroku, Netlify, Vercel etc.

      - name: Set deployment state
        if: always()
        run: |
          gh api \
          --method POST \
          -H "Accept: application/vnd.github.v3+json" \
          /repos/${{ github.repository_owner }}/${{ github.event.repository.name }}/deployments/${{ github.event.deployment.id }}/statuses \
          -f environment="${{ github.event.deployment.environment }}" \
          -f state="${{ job.status == 'success' && 'success' || 'failure' }}" \
```


#### Configuration options

> **Note**  
> For an in-depth explanation of And Action's configuration, please see [Configuration](#configuration).

Options regarding the Commits & Deployments view are set below the `deployment` property in your `andaction.yml`.

Currently, there are two options regarding deployments: `environments` and `excluded-workflows`

Example configuration for `deployment`:

```yaml
deployment:
  environments:
    - dev
    - test
    - live
  excluded-workflows:
    - Deploy
    - Manually deploy app
```


##### environments

This property contains a list of available environments in the order of deployment. So in the example above, there are three environments and deployments can only be triggered in the order `dev`, `test` and `live`.


##### excluded-workflows

To trigger a deployment for a commit, the commit must be in a successful state, i.e. all of its checks and workflow runs must be successful. It might happen that there are workflows configured that should not considered for that check, e.g. a workflow that manually deploys the app to some demo server.

To exclude them from the view, list them as `excluded-workflows`.

The items in the list are the names that you define within that workflow, it is **not** the filename.

> **Note**  
> The deploy workflow **must** be included in this list. Otherwise, you can never redeploy a commit that has a failed deployment.


### Configuration

The chapters above already explained the available properties for the configuration files.
This chapter explains where And Action searches the configuration files and how they are combined.

In general, you can set the configuration at organization level or at repository level.
To set a configuration for the whole organization you need to create a repository `.github` within that organization. In that repository you must create the file `andaction.yml` in the `.github` directory.

Example: Assuming that your organization has the name `my-org` you create the repository `my-org/.github`. Within that repository, you create the file `.github/andaction.yml`.

Additionally, it is possible to set a configuration for a specific repository. To do so, you create the file `.github/andaction.yml` in the particular repository.

If there is both, a configuration at organization level and a configuration at repository level, these files are combined and the repository's configuration takes precedence over the organization's configuration.

The top level properties are merged. Their child properties are **not** merged. Properties from the organization's configuration are set and overwritten by the repository's property.

#### Example Files

```yaml
# Organization configuration
actions:
  excluded-workflows:
    - Manually deploy app

deployment:
  environments:
    - dev
    - test
    - live
  excluded-workflows:
    - Manually deploy app
```
```yaml
# Repository configuration
deployment:
  excluded-workflows:
    - Deploy
    - Test checks
```
```yaml
# Resulting configuration
actions:
  excluded-workflows:
    - Manually deploy app

deployment:
  environments:
    - dev
    - test
    - live
  excluded-workflows:
    - Deploy
    - Test checks
```


## Development


### Development Setup

To create an environment for local development on your machine, install [Node.js](https://nodejs.org), clone the repository and run `npm install`.


#### Configure GitHub OAuth App

In production, And Action leverages the GitHub OAuth App "And Action" to handle logins. When developing And Action locally on your machine, you need to have a GitHub OAuth App in place that handles the login and redirects you back to `http://localhost:4200` after successful login.

Please follow these steps to create the GitHub OAuth App:

1. Open your GitHub profile or the GitHub organization in your browser that you want the GitHub OAuth App to live in.
2. Open Settings -> Developer settings -> OAuth Apps.
3. Click "New OAuth App".
4. Give your app some meaningful name like "And Action local development". Homepage URL can be set to some random value. Authorization callback URL must be `http://localhost:4200`. Submit the form.
5. Generate a new client secret. Copy the client ID and the generated client secret. The secret cannot be made visible later on.
6. Create a `.env` file in the root folder of the cloned repository on your machine and add the following two environment variables with the values that you just generated:
    ```
    GITHUB_CLIENT_ID=<GitHub client ID>
    GITHUB_CLIENT_SECRET=<GitHub client secret>
    ```

Now your local login api should be able to handle your login requests correctly.


#### Run And Action locally

Run `npm start` to start And Action. Open your browser and navigate to `http://localhost:4200`. The app starts. `npm start` also starts the local login api.

The local login api serves a simple implementation of the login api for And Action for local development. When clicking "Login with GitHub" in And Action the login api redirects to the login form on GitHub using the client id and client secret configured in your `.env` file. After successful login, you will be redirected to `http://localhost:4200`. Now you are logged in and can use the locally running app as known from production.


### Releases

New features are developed in separate feature branches. Pushing them to GitHub runs the CI workflow in GitHub actions. Merging a feature branch to master also runs the CI workflow. Additionally, the app is deployed on `https://staging.andaction.dev`.

Creating a GitHub release deploys the app to production on `https://andaction.dev`. 


### Renovate

And Action uses [MEND Renovate](https://www.mend.io/renovate/) to update NPM packages automatically on a weekly basis. Configuration is defined in `renovate.json`.


### Storybook

Storybook is used to implement components in isolation.
Run `ng run and-action:storybook` to open Storybook.
