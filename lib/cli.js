var path      = require('path'),
    fs        = require('fs'),
    read      = require('read'),
    ApiCli    = require('api-cli'),
    Codematic = require('codematic');

var app = new ApiCli({
	AppName      : 'codematic',              // {string} Application name
	AppBin       : 'codematic',              // {string} Application executable
	AppVersion   : '0.1.2',                  // {string} The required API version
	AppUsage     : 'codematic <options>',
	AppNoApi     : true,

	ApiParams: [
		{
			'name': 'request',
			'type': 'object'
		},
		{
			'name': 'log',
			'type': 'object'
		},
		{
			'name': 'params',
			'type': 'array'
		},
		{
			'name': 'onStartup',
			'type': 'array'
		},
		{
			'name': 'onFilechange',
			'type': 'array'
		},
		{
			'name': 'onSchedule',
			'type': 'array'
		},
		{
			'name': 'onInput',
			'type': 'array'
		},
		{
			'name': 'onShutdown',
			'type': 'array'
		}
	],

	CliParams: [                             // {array}  Default CLI options and short hands
		{
			'name': 'help',
			'type': 'boolean',
			'description': 'Show help'
		},
		{
			'name': 'config',
			'type': 'string',
			'description': 'Configuration file'
		},
		{
			'name': 'watch',
			'type': 'boolean',
			'description': 'Watch mode'
		},
		{
			'name': 'silent',
			'type': 'boolean',
			'description': 'Silent mode'
		},
		{
			'name': 'code',
			'type': 'string',
			'description': 'Process a single code'
			// 'input': 'text'
		}
	],
	CliInputs: {},
	CliShortcuts: {
		'c': ['--config'],
		'h': ['--help']
	},
	execute: function() {
		try {
			this.codematic = new Codematic({
				params: this.option('params', {}),
				onStartup: this.option('onStartup', []),
				onInput: this.option('onInput', []),
				onFilechange: this.option('onFilechange', []),
				onSchedule: this.option('onSchedule', []),
				onShutdown: this.option('onShutdown', []),
				request: this.option('request', {}),
				log: this.option('log', {})
			});

			this.codematic.registerDefaultActions();

			// Register the log function
			if (!this.option('silent', false)) {
				this.codematic.log = function(msg) {
					console.log(msg);
				}
			}

			this.codematic.runStartup(function() {
				this.codematic.runSchedule();
				this.codematic.runFilechange();
			}.bind(this));

			if (this.option('code')) {
				this.codematic.runInput(this.option('code'), function() {
					this.codematic.runShutdown();
				}.bind(this));
				return;
			}

			if (this.CliOptions.watch) {
				this.watch();
				return;
			}

			this._showCliHelp();
		} catch(e) {
			console.log('Error:', e);
		}
	},
	watch: function() {
		read({prompt: ' Code: ', 'silent': false}, function(er, input) {
			try {
				if (input == '') {
					this.codematic.runShutdown();
					return;
				}

				this.processCode(input, this.watch.bind(this));
			} catch(e) {
				console.log('Error:', e);
			}
		}.bind(this));
	},
	processCode: function(code, callback) {
		this.codematic.runInput(code, callback);
	}
});
app.run();
