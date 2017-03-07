Codematic CLI
=============

Codematic is a set of tools that enables process automation by using barcodes or
QR codes - or any type of code that can be entered through a scanning device.

You can define a set of processing rules through a JSON or YAML file that will
execute a chain of actions based on the barcode that has been scanned.

The CLI is targeted towards simple input devices. One general application
scenario was using simple and cheap computing devices (e.g. a Raspberry Pi)
in order to scan codes (e.g. an order code) and execute simple commands,
such as a status update in the company's ERP system or printing a
delivery note for a parcel, etc.

The configuration is really simple, so that you can create simple and reusable
scanning apps in order to automate your processes.


Installation
------------

Install Node.JS and install globally via NPM:

```
npm install -g codematic-cli
```


Usage
-----

```
codematic <options>
```

Options:

| Parameter | Type    | Description           |
|:----------|:--------|:----------------------|
| help      | boolean | Show help             |
| config    | string  | Configuration file    |
| watch     | boolean | Watch mode            |
| silent    | boolean | Silent mode           |
| code      | string  | Process a single code |


Example: Constantly watch for new codes:

```
codematic --config config.yaml --watch
```


Options
-------

### Rules

As you can see in the example, it is very easy to define new rules. A rule consists of
the following parameters:

* A `name` to describe the rule
* An `input` definition, which represents a regular expression that matches the expected code
* An `action` sequence that will be executed when the code is entered

As you can see, an action sequence is chained through `then` and `error` callbacks.
You can pass on parameters and substitute variables within strings.

Also, it is very easy to define your own action using the `registerAction` method.

Codematic ships with a set of default actions, documented below.


### Log Setting

Defines the log settings. If `log.file` is set, all processed codes will be written
to the specified log file including the date/time.


### Request Settings

In order to make it easy to work with REST services, you can easily define a base URL
as well as a standard username and password.


Default Actions
---------------

### beep

Emits a "noise" through the default system speaker

Parameters:

* `count`: Number of beeps (default: 1)
* `delay`: Delay between beeps


### store

Stores a value in a variable

Parameters:

* `var`: Variable name
* `value`: Variable value (default is the last code that has been scanned)


### output

Writes a string to the console using the `log` method.

Parameters:

* `data`: Output data

### writefile

Writes a file

Parameters:

* `filename`: The filename
* `mode`: "append" or "write" (default is "write")
* `data`: The file data


### readfile

Reads a file and stores it to the local store

Parameters:

* `filename`: The filename
* `var`: Variable name (default is `FILE`)


### clear

Clears a single slot or - if no variable is defined - all variable slots

Parameters:

* `var`: Variable name


### exec

Executes an external program and stores the output to a variable

Parameters:

* `command`: Command path
* `var`: Variable name


### request

Performs an HTTP request

Parameters:

* `url`: The request URL
* `route`: If you have configured a global base URL in the Codematic options, you can also define a single route instead of a full URL
* `method`: GET, POST, PUT, DELETE (default is GET)
* `var`: The variable name for the response value (default is `RESPONSE`)


Sample Configuration
--------------------

```yaml
---
  ---
  request:
    url: https://cloud.zeyos.com/pepe/remotecall/barcodeapi
    username: ''
    password: ''
  log:
    error: log/error.log
    default: log/default.log
  rules:
  - name: Test Request
    input: "^X[0-9]+"
    action:
      type: request
      route: "/"
      then:
        type: beep
        count: 5
        delay: 10
        then:
          type: output
          data: Value stored %testvar%
  - name: Store the barcode
    input: "^A[0-9]+"
    action:
      type: store
      var: testvar
      then:
        type: beep
        count: 5
        delay: 10
        then:
          type: output
          data: Value stored %testvar%
  - name: Scan new barcode for request
    input: "^R[0-9]+"
    action:
      type: writefile
      filename: test.txt
      mode: append
      data: Hallo %testvar%
      then:
        type: output
        data: File written
  - name: Check the wildcard
    input: ".*"
    action:
      type: store
      var: testvar
      then:
        type: output
        data: Value stored %testvar%
        then:
            type: request
            method: GET
            var: resp
            route: /%testvar%
            then:
              type: output
              data: Server response %resp%
```
