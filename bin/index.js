#!/usr/bin/env node

const fs = require('fs-extra')
const program = require('commander')
const inquirer = require('inquirer')
const Listr = require('listr')
const UpdaterRenderer = require('listr-update-renderer')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

program.version('1.0.0', '-v, --version')
  .arguments('<name>')
  .action((name) => {
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'existDir',
        message: `Project ${name} already exists, want to continue?`,
        when () {
          return fs.existsSync(name)
        }
      },
      {
        type: 'confirm',
        name: 'multiLanguage',
        message: 'Project need to support multiple languages?',
        when (answers) {
          return answers.existDir !== false
        }
      },
      {
        type: 'input',
        name: 'repository',
        message: 'Please input templates repository?'
      }
    ]).then((answers) => {
      if (answers.existDir === false) { return }

      const tasks = new Listr(
        [
          {
            title: 'create react app',
            task: () => execAsync(`npx create-react-app ${name}`)
          },
          {
            title: 'install dependencies',
            task: () => new Listr(
              [
                {
                  title: 'add router',
                  task: () => execAsync('npm install react-router-dom --save', { cwd: name })
                },
                {
                  title: 'add mobx',
                  task: () => execAsync('npm install mobx mobx-react --save', { cwd: name })
                },
                {
                  title: 'add material-ui',
                  task: () => execAsync('npm install @material-ui/core --save', { cwd: name })
                },
                {
                  title: 'add react-intl',
                  enabled: () => answers.multiLanguage,
                  task: () => execAsync('npm install react-intl --save', { cwd: name })
                }
              ],
              {
                concurrent: true
              }
            )
          },
          {
            title: 'download template',
            task: () => execAsync(`git clone --depth 1 ${answers.repository} templates`, { cwd: name })
              .then(() => {
                fs.copySync(`${name}/templates`, `${name}/src`, { filter: src => !src.includes('.git') })
                fs.removeSync(`${name}/templates`)
              })
          }
        ],
        {
          renderer: UpdaterRenderer,
          collapse: false
        })

      tasks.run().catch(err => {
        console.error(err)
      })
    })
  })
program.parse(process.argv)
