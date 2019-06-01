#!/usr/bin/env node

const fs = require('fs-extra')
const program = require('commander')
const download = require('download-git-repo')
const lodash = require('lodash')
const inquirer = require('inquirer')
const chalk = require('chalk')
const symbols = require('log-symbols')
const Listr = require('listr')
const execa = require('execa')
const UpdaterRenderer = require('listr-update-renderer');
/*async function installDependencies(steps) {
  for (let step of steps) {
    step.ora = ora(step.tip).start()

    await execAsync(step.command)
    step.ora.succeed()
  }
}*/

program.version('1.0.0', '-v, --version')
  .command('<name>')
  .action((name) => {
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'existDir',
        message: `${name}项目已存在，是否继续？`,
        when () {
          return fs.existsSync(name)
        }
      }
    ]).then((answers) => {
      /*const spinner = ora('正在下载模板...');
      spinner.start();
      download('http://xxxxxx:9999:HTML5/H5Template#master', name, {clone: true}, (err) => {
        if(err){
          spinner.fail();
          console.log(symbols.error, chalk.red(err));
        }else{
          spinner.succeed();
          const fileName = `${name}/package.json`;
          const meta = {
            name,
            description: answers.description,
            author: answers.author
          }
          if(fs.existsSync(fileName)){
            const content = fs.readFileSync(fileName).toString();
            const result = handlebars.compile(content)(meta);
            fs.writeFileSync(fileName, result);
          }
          console.log(symbols.success, chalk.green('项目初始化完成'));
        }
      })*/
      /*const createReactAppOra = ora('create react app').start()
      const addRouter = ora('add react router').start()
      const addMobx = ora('add mobx').start()
      const addMaterialUI = ora('add material-ui').start()*/

      /*execAsync(`npx create-react-app ${name}`)
        .then(() => {
          retd
        })
        .catch(err => {})*/
      /*const commands = [
        `npx create-react-app ${name} && cd ${name}`,
        'npm install react-router-dom --save',
        'npm install mobx mobx-react --save',
        'npm install @material-ui/core --save'
      ]*/
      /*


            const steps = [
              {
                command: `npx create-react-app ${name}`,
                tip: 'create react app'
              },
              {
                command: `cd ${name} && npm install react-router-dom --save`,
                tip: 'add react router'
              },
              {
                command: `cd ${name} && npm install mobx mobx-react --save`,
                tip: 'add mobx'
              },
              {
                command: `cd ${name} && npm install @material-ui/core --save`,
                tip: 'add material-ui'
              }
            ]

            execAsync()
            execCommands(steps)*/
      if (answers.existDir === false) { return }

      const tasks = new Listr([
          {
            title: 'create react app',
            task: () => execa(`npx create-react-app ${name}`)
          },
          {
            title: 'install dependencies',
            task: () => new Listr(
              [
                {
                  title: 'add router',
                  task: () => execa.stdout('npm install react-router-dom --save', { cwd: name })
                },
                {
                  title: 'add mobx',
                  task: () => execa.stdout('npm install mobx mobx-react --save', { cwd: name })
                },
                {
                  title: 'add material-ui',
                  task: () => execa.stdout('npm install react-router-dom --save', { cwd: name })
                }
              ],
              {
                concurrent: true,
                renderer: UpdaterRenderer,
                collapse: false
              }
            )
          },
          {
            title: 'download template',
            task: () => execa.stdout('git clone -b \'templates\' --single-branch --depth 1 https://github.com/shitouplus/create-cms-app.git templates')
              .then(data => {
                fs.removeSync('.git', { cwd: 'templates' })
                fs.moveSync('templates', name)
                return data
              })
          }
        ]
      )

      tasks.run().catch(err => {
        console.error(err)
      })
    })
  })
program.parse(process.argv)
