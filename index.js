#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const replace = require('replace-in-file');

const path = require('path');

var files = [];

function fileDisplay(filePath){
      const filedirs = fs.readdirSync(filePath);
      filedirs.forEach(function(filename){
        //获取当前文件的绝对路径
        var filedir = path.join(filePath,filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        const stat =  fs.statSync(filedir);
        if(stat.isDirectory()){
        	 fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
            } else if (stat.isFile()){
            	files.push(filedir);
            } else {
            	return;
            }
        });
}

program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if(!fs.existsSync(name)){
            inquirer.prompt([
                {
                    name: 'description',
                    message: '请输入项目描述'
                },
                {
                    name: 'author',
                    message: '请输入作者名称'
                }
            ]).then((answers) => {
                const spinner = ora('别着急：）正在下载模板...');
                spinner.start();

                download('https://github.com:ASkyBig/00000000#master', name, {clone: true}, (err) => {
                    if(err){
                        spinner.fail();
                        // console.log(symbols.error, chalk.red(err));
                    }else{
                        spinner.succeed();

                        const basePath = path.join(process.cwd(), name);

						console.log('path ===',basePath);
                    
                        fileDisplay(basePath);

                        const options = {
						  files: files,

						  //Replacement to make (string or regex) 
						  from: /00000000/g,
						  to: name,
						};

						replace(options)
						  .then(changedFiles => {
						    console.log('Modified files:', changedFiles.join(', '));
						  })
						  .catch(error => {
						    console.error('Error occurred:', error);
						  });

                        const fileName = `${name}/index.html`;
                        console.log('fileName', fileName)
                        const meta = {
                            description: answers.description,
                            author: answers.author,
                            date: Date()
                        }
                        console.log('meta', meta)
                        console.log('fs.existsSync(fileName)===', fs.existsSync(fileName))
                        if(fs.existsSync(fileName)){
                            const content = fs.readFileSync(fileName).toString();
                            console.log('content===', content)
                            const result = handlebars.compile(content)(meta);
                            console.log('result===', result)
                            fs.writeFileSync(fileName, result);
                        }
                        console.log(symbols.success, chalk.green('项目初始化完成'));
                    }
                })
            })
        }else{
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在了:('));
        }
    })
program.parse(process.argv);