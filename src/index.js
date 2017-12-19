#!/usr/bin/env node

'use strict';
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const program = require('commander');
const chalk = require('chalk');
const showdown = require('showdown');
const hljs = require('highlight.js');
const rimraf = require('rimraf');

const htmlStart = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title></title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.9.0/github-markdown.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/atom-one-light.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>
    <script>hljs.initHighlightingOnLoad();</script> 
    <link href="css/style.css" rel="stylesheet">
    <style>
      * {
				box-sizing: border-box;
			}
      body {
				min-width: 200px;
				max-width: 980px;
				margin: 0 auto;
				padding: 45px;
			}

      .search-bar {
        position: relative;
        width: 100%;
        height: 50px;
        margin-bottom: 20px;
      }

      .search-bar__input {
        position: relative;
        width: 100%;
        height: 100%;
        /* padding: 5px 50px 5px 50px; */
        text-align: center;
        max-width: 980px;
        font-size: 24px;
        font-family: 'Calibri';
        color: #bbbbbb;
        outline: none;
        background-color: rgb(238, 238, 238);

        border-style: none;
        border-radius: 5px;
      }

      .search-bar__input:focus {
        color: #505050;
      }
    </style>
  </head>
  <body>
  <div class="search-bar">
    <input class="search-bar__input" type="text" value="Search...">
  </div>
  <article class="markdown-body">`;

const htmlEnd = `</article></body>
</html>`;

const converter = new showdown.Converter({tables: true, simpleLineBreaks: true, ghCompatibleHeaderId: true});
converter.setFlavor('github');

const createDocs = (directory, options) => {
  const dir = path.resolve(__dirname, '../' + directory);
  const output = path.resolve(__dirname, '../' + options.destination)

  
  if(options.clean) {
    console.log( chalk.yellow.bold.underline(`Deleting ${output} ...`) );
    rimraf(output, () => {
      console.log( chalk.yellow.bold.underline(`Done deleting ${output}`) );
      processDirectory(dir, output);
    })
  } else {
    processDirectory(dir, output);
  }

};

const processDirectory = (dir, dest) => {
  const directory = dir;
  const destination = path.resolve(__dirname, dest);
  // console.log(directory);
  fs.readdir(directory, function(err, files) {
    files
      .filter((file) => { return file.substr(-3) === '.md'; })
      .forEach((file) => {
        const filePath = path.resolve(__dirname, directory + '/' + file);
        // console.log(chalk.green.bold.underline(filePath)); 
        fs.readFile(filePath, 'utf-8', (err, data) => {
          const filename = file.slice(0, -3) + '.html';
          parseFile(filename, data);
        }); 
      });
  });

  const parseFile = (filename, data) => {
    const outputPath = path.resolve(__dirname, destination + '/' + filename);

    const convertedData = converter.makeHtml(data);
    const outputDoc = htmlStart + convertedData + htmlEnd;

    if (!fs.existsSync(destination)){
      fs.mkdirSync(destination);
    }

    fs.writeFile(outputPath, outputDoc, 'utf8', (err) => {
      if (err) throw err;
      console.log(chalk.green.bold.underline(`Done creating file: ${filename}`));
    });

  }

};

program
  .version('0.0.1')
  .command('make <directory>')
  .description('Parse all .md files in directory and output to destination')
  .option('-d, --destination <dir>','Destination folder')
  .option('-c, --clean','Deletes all files in destination folder before generating html files')
  .action(createDocs);

program.parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();













// let listFunction = (directory, options) => {
//   const cmd = 'ls';
//   let params = [];
//   if(options.all) params.push('a');
//   if(options.long) params.push('l');
//   let fullCommand = params.length ? cmd + ' -' + params.joing('') : cmd;
//   if(directory) fullCommand += ' ' + directory;

//   let execCallback = (error, stdout, stderr) => {
//     if (error) console.log(chalk.red.bold.underline("exec error:") + error);
//     if (stdout) console.log(chalk.green.bold.underline("Result:") + stdout);
//     if (stderr) console.log(chalk.red("Error: ") + stderr);
//   };

//   exec(fullCommand, execCallback);

// }