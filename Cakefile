fs            = require 'fs'
wrench        = require 'wrench'
{print}       = require 'util'
which         = require 'which'
{spawn, exec} = require 'child_process'

# ANSI Terminal Colors
bold  = '\x1B[0;1m'
red   = '\x1B[0;31m'
green = '\x1B[0;32m'
reset = '\x1B[0m'

pkg = JSON.parse fs.readFileSync('./package.json')
testCmd = pkg.scripts.test
startCmd = pkg.scripts.start
  

log = (message, color, explanation) ->
  console.log color + message + reset + ' ' + (explanation or '')

# Compiles app.coffee and src directory to the .app directory
build = (callback) ->
  options = ['-c','-b', '-o', '.app', 'src']
  cmd = which.sync 'coffee'
  coffee = spawn cmd, options
  coffee.stdout.pipe process.stdout
  coffee.stderr.pipe process.stderr
  coffee.on 'exit', (status) -> callback?() if status is 0

# mocha test
test = (callback) ->
  options = [
    '--globals'
    'hasCert,res'
    '--reporter'
    'spec'
    '--compilers'
    'coffee:coffee-script/register'
    '--colors'
    '--require'
    'should'
    '--require'
    './server'
  ]
  try
    cmd = which.sync 'mocha' 
    spec = spawn cmd, options
    spec.stdout.pipe process.stdout 
    spec.stderr.pipe process.stderr
    spec.on 'exit', (status) -> callback?() if status is 0
  catch err
    log err.message, red
    log 'Mocha is not installed - try npm install mocha -g', red

task 'docs', 'Generate annotated source code with Docco', ->
  files = wrench.readdirSyncRecursive("src")
  files = ("src/#{file}" for file in files when /\.coffee$/.test file)
  log files
  try
    cmd ='./node_modules/.bin/docco-husky' 
    docco = spawn cmd, files
    docco.stdout.pipe process.stdout
    docco.stderr.pipe process.stderr
    docco.on 'exit', (status) -> callback?() if status is 0
  catch err
    log err.message, red
    log 'Docco is not installed - try npm install docco -g', red


task 'build', ->
  build -> log ":)", green

task 'spec', 'Run Mocha tests', ->
  build -> test -> log ":)", green

task 'test', 'Run Mocha tests', ->
  build -> test -> log ":)", green

task 'dev', 'start dev env', ->
  # watch_coffee
  options = ['-c', '-b', '-w', '-o', '.app', 'src']
  cmd = which.sync 'coffee'  
  coffee = spawn cmd, options
  coffee.stdout.pipe process.stdout
  coffee.stderr.pipe process.stderr
  log 'Watching coffee files', green
  # watch_js
  supervisor = spawn 'node', [
    './node_modules/supervisor/lib/cli-wrapper.js',
    '-w',
    '.app,views', 
    '-e', 
    'js|jade', 
    'server'
  ]
  supervisor.stdout.pipe process.stdout
  supervisor.stderr.pipe process.stderr
  log 'Watching js files and running server', green
  
task 'debug', 'start debug env', ->
  # watch_coffee
  options = ['-c', '-b', '-w', '-o', '.app', 'src']
  cmd = which.sync 'coffee'  
  coffee = spawn cmd, options
  coffee.stdout.pipe process.stdout
  coffee.stderr.pipe process.stderr
  log 'Watching coffee files', green
  # run debug mode
  app = spawn 'node', [
    '--debug',
    'server'
  ]
  app.stdout.pipe process.stdout
  app.stderr.pipe process.stderr
  # run node-inspector
  inspector = spawn 'node-inspector'
  inspector.stdout.pipe process.stdout
  inspector.stderr.pipe process.stderr
  # run google chrome
  chrome = spawn 'google-chrome', ['http://0.0.0.0:8080/debug?port=5858']
  chrome.stdout.pipe process.stdout
  chrome.stderr.pipe process.stderr
  log 'Debugging server', green
  
option '-n', '--name [NAME]', 'name of model to `scaffold`'
task 'scaffold', 'scaffold model/controller/test', (options) ->
  if not options.name?
    log "Please specify model name", red
    process.exit(1)
  log "Scaffolding `#{options.name}`", green
  scaffold = require './scaffold'
  scaffold options.name
  






{spawn} = require "child_process"
path = require "path"
_ = require "lodash"

pipelineStdout = (process) ->
  process.stdout.on "data", (data) =>
    console.log data.toString().replace(/\n$/m, '')

  process.stderr.on "data", (data) =>
    console.log data.toString().replace(/\n$/m, '')

  process.on "close", =>
    console.log "Done"

recreateSequelizeConfig = =>
  configFile = "./config/config.json"
  configPath = path.dirname(configFile)
  fs.mkdirSync configPath unless fs.existsSync(configPath)
  env = process.env.NODE_ENV or 'development'
  cfg = require('config')
  tempConfig = {}
  tempConfig[env] =
    database: cfg.database.name
    username: cfg.database.user
    password: cfg.database.password
  tempConfig[env].dialect = cfg.database.options.dialect
  fs.writeFileSync configFile, JSON.stringify(tempConfig)
  return configFile

option "-t", "--title [title]", "Migration title. Usage: cake -t foo db:migrations:create"
task 'db:migrations:create', 'Create a new migration', (options) ->
  name = options.title or "unnamed"
  migrate = spawn "./node_modules/.bin/sequelize", ["--config", recreateSequelizeConfig(), "--coffee", "-c", name]
  pipelineStdout(migrate)


task 'db:migrations:run', 'Migrate the database schema', ->
  migrate = spawn "./node_modules/.bin/sequelize", ["--config", recreateSequelizeConfig(), "--coffee", "-m"]
  pipelineStdout(migrate)


task 'db:search_vector:update', 'Updates search vectors data', ->
  build ->
    Sequelize = require("sequelize")
    _ = require 'lodash'
    models = require './.app/models'
    customEmitter = new Sequelize.Utils.CustomEventEmitter (emitter) ->
      modelsProcessed = {}
      for modelName, model of models
        if _.isFunction(model.addFullTextIndex)
          modelsProcessed[modelName] = false
          model.addFullTextIndex (chainer) ->
            chainer.error (e) -> emitter.emit('error', e)
            chainer.success =>
                modelsProcessed[@name] = true
                emitter.emit('success') if _.every(modelsProcessed)
    customEmitter.complete (err) ->
      if err?
        console.error 'ERROR! ', e
      else
        console.info 'Update complete'
      process.exit()
    customEmitter.run()

initSequelize = (forCreation = false) =>
  return @_sequelize if @_sequelize?
  @_Sequelize ?= require "sequelize"
  @_sequelize = null
  cfg = require('config')
  dbName = unless forCreation then cfg.database.name else switch cfg.database.options.dialect
      when 'postgres' then 'postgres'
      else null
  @_sequelize = new @_Sequelize(dbName, cfg.database.user, cfg.database.password, cfg.database.options)
  @_sequelize.config.originalDatabase = cfg.database.name if forCreation
  @_sequelize


task 'db:create', 'Create the database', ->
  sequelize = initSequelize(true)
  db_name = sequelize.config.originalDatabase || sequelize.config.database
  sequelize.query("CREATE DATABASE #{db_name};") # OWNER #{sequelize.config.username}} ENCODING #{sequelize.globalOptions.charset} LC_COLLATE #{sequelize.globalOptions.collate};")
    .success -> console.log "Databse #{db_name} has been successfully created"
    .error (e) -> console.log e

task 'db:drop', 'Drop the database', ->
  sequelize = initSequelize(true)
  db_name = sequelize.config.originalDatabase || sequelize.config.database
  sequelize.query("DROP DATABASE #{db_name};")
    .success -> console.log "Databse #{db_name} has been successfully dropped"
    .error (e) -> console.log e