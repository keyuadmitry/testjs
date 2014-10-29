# Nodeflow - A TrustMetrics appshop scraper

### Development environment

Prerequisites:

* NodeJS v0.10.26 or later with [NPM](https://www.npmjs.org/) v1.4.0 or later
* Redis 2.8.4 or later
* PostgreSQL 9.3.0 or later

OSX users can install all these packages via [Homebrew](http://brew.sh).
Once you have all this installed, clone the repo and `cd` into the folder.
Next, install `coffee-script` globally by running
  
  `npm install -g coffee-script`

Then install all the dependencies by running

  `npm install`
  
Now copy a sample dev config
  
  ```bash
  cp config/development.yml.sample config/development.yml
  ```
  
and change it according to your needs.  

#### Building & running

Such type of tasks are done via `cake`. To see all available caketasks, just run it:

```bash
$ cake
Cakefile defines the following tasks:

cake docs                 # Generate annotated source code with Docco
cake build                
cake spec                 # Run Mocha tests
cake test                 # Run Mocha tests
cake dev                  # start dev env
cake debug                # start debug env
cake scaffold             # scaffold model/controller/test
cake db:migrations:create # Create a new migration
cake db:migrations:run    # Migrate the database schema
cake db:create            # Create the database
cake db:drop              # Drop the database

  -n, --name         name of model to `scaffold`
  -t, --title        Migration title. Usage: cake -t foo db:migrations:create
```

Do create a database, run `cake db:create`.
Do project build, run `cake build`.

To launch the app, run `cake dev`. But before, make sure the DB structure ha been initialized (refer to the section below).


#### Database Migrations

To initialize database schema, use the `db:init` caketask:

```bash
$ cake db:init
DB init...
Forced DB sync complete
```

_more info coming soon_

### Deploying

Deployment is powered by [Capistrano v2](https://github.com/capistrano/capistrano/wiki) and [PM2](https://github.com/Unitech/pm2).
To install Capistrano, you need to install Ruby 1.9.3+, `cd` into the project folder and run `bundle install`.
Like the most modern deployments, Nodeflow can be configured for several _environments_ - currently they're _development_,
_staging_ and _production_. Configuration is done via the YAML files under `config` directory. The `default.yml` file stores
shared configuration options.

To deploy to a new server, it should be prepared by completing following steps:
 * Install software
     * NodeJS v0.10.26+ & NPM v1.4.0+
     * Redis 2.8.4+
     * PostgreSQL 9.3.0+
     * PM2
 * Create `nodejs` user with a home directory
 * Prepare a database according to the settings from the correspondng environment config _(config/*.yml)
    * Create DB user
    * Create DB itself with full access granted to the DB user

All of the examples uses staging server and app environment.
The first deploy is done by the following steps:
  * `cd` to local nodeflow dir
  * make sure the proper ruby and gemset are activated
  * `bundle install` - to install Capistrano
  * `cap staging deploy:setup` - to prepare folders on the remote server
  * `cap staging deploy:cold` - to perform an initial deploy

Then the app should be up and running on the server. To undertstand the process better, it's recommended to examine the deployment
recipe which is located in the `confg/deploy.rb` file.

To make futher deploys, just run:
```bash
cap staging deploy
```

Deployment recipe relies on git tags which represents application versions. To deploy a new version you need to create a tag like `v1.0.0` and push it. After you run `cap <environment> deploy` script, it will ask for a tag to deploy (default to the latest).
In case you need to make a quick deploy without tagging, you can enter the git branch or commit SHA as the tag name during deploy:
```
$ cap staging deploy 
  * 2014-08-20 16:38:42 executing `staging'
Tag to deploy (make sure to push the tag first): [v0.6.1] develop
  * 2014-08-20 16:38:43 executing `deploy'
  * 2014-08-20 16:38:43 executing `deploy:update'
 ** transaction: start
  * 2014-08-20 16:38:43 executing `deploy:update_code'
    executing locally: "git ls-remote git@github.com:Format/nodeflow.git develop"
```

There's also few handy capistrano tasks:
* `cap staging node:info` will show information about all remote processes monitored by PM2
* `cap staging node:logs` will stream all logs from remote processes
