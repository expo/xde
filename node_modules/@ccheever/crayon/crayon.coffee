"use strict"

__doc__ = """
An implementation of `chalk` with better performance characteristics, 256 color support, a few other features, and built-in logging.

"""

util = require 'util'

hasColor = require 'has-color'
stripAnsi = require 'strip-ansi'

ansi256css = require './ansi256css'
cssToAnsi = require './css-to-ansi'

logLevels = ['log', 'info', 'warn', 'error']

basics =
  reset: [0, 0]

  bold: [1, 22]
  italic: [3, 23]
  underline: [4, 24]
  inverse: [7, 27]
  blink: [5, 25]
  #blinkFast: [6, 25] # Not widely supported
  #strikethrough: [9, 29] # Not widely supported

  black: [30, 39]
  red: [31, 39]
  green: [32, 39]
  yellow: [33, 39]
  blue: [34, 39]
  magenta: [35, 39]
  cyan: [36, 39]
  white: [37, 39]
  gray: [90, 39]

  brightred: [91, 39]
  brightgreen: [92, 39]
  brightyellow: [93, 39]
  brightblue: [94, 39]
  brightmagenta: [95, 39]
  brightcyan: [96, 39]
  brightwhite: [97, 39]

  bgBlack: [40, 49]
  bgRed: [41, 49]
  bgGreen: [42, 49]
  bgYellow: [43, 49]
  bgBlue: [44, 49]
  bgMagenta: [45, 49]
  bgCyan: [46, 49]
  bgWhite: [47, 49]

  bgGray: [100, 49]
  bgBrightred: [101, 49]
  bgBrightgreen: [102, 49]
  bgBrightyellow: [103, 49]
  bgBrightblue: [104, 49]
  bgBrightmagenta: [105, 49]
  bgBrightcyan: [106, 49]
  bgBrightwhite: [107, 49]

basics.grey = basics.gray
basics.bgGrey = basics.bgGray

VERY_DARK_COLORS = [0, 16, 17, 18, 232, 233, 234, 235 ]

codes = {}
for styleName, [begin, end] of basics
  codes[styleName] = ['\u001b[' + begin + 'm', '\u001b[' + end + 'm']

for color, code of cssToAnsi
  if basics[color]?
    color = color + '_'
  codes[color] = ['\u001b[38;5;' + code + 'm', '\u001b[39m']
  codes['bg' + color[0].toUpperCase() + color[1...].toLowerCase()] = ['\u001b[48;5;' + code + 'm', '\u001b[49m']

_rainbow = (s) -> (crayon(i * 19 % 256 + 12 * (i in VERY_DARK_COLORS))(c) for c, i in stripAnsi s).join ''

addColorFuncs = (obj, prevStyles) ->
  """Adds functions like `.red` to an object"""

  for name, style of codes

    do (name, style) ->
      Object.defineProperty obj, name,
        enumerable: true
        configurable: true
        get: ->
          newStyles = [styleFunc codes[name]...].concat prevStyles
          f = makeStyleFunc newStyles
          f.__doc__ = """Applies the style '#{ name }' to the crayon"""
          delete obj[name]
          obj[name] = f

  for n in [0...256]
    do (n) ->
      for x in ["#{ n }", "_#{ n }"]
        Object.defineProperty obj, x,
          enumerable: true
          configurable: true
          get: ->
            newStyles = [foregroundCode n].concat prevStyles
            f = makeStyleFunc newStyles
            f.___doc___ = """Sets the foreground color of the crayon to #{ n }"""
            delete obj[n]
            obj[n] = f

      Object.defineProperty obj, "bg#{ n }",
        enumerable: true
        configurable: true
        get: ->
          newStyles = [backgroundCode n].concat prevStyles
          f = makeStyleFunc newStyles
          f.___doc___ = """Sets the background color of the crayon to #{ n }"""
          delete obj[n]
          obj[n] = f


  for [name, newStyleFunc] in [
    ['foreground', (x) -> [foregroundCode getColorNumber x]]
    ['background', (x) -> [backgroundCode getColorNumber x]]
    ['fgbg', (fg, bg) ->  [foregroundCode(getColorNumber fg), backgroundCode(getColorNumber bg)]]
    ['color', general]
  ]
    do (name, newStyleFunc) ->
      obj[name] = (desc...) ->
        makeStyleFunc newStyleFunc(desc...).concat prevStyles

  obj.fg = obj.foreground
  obj.bg = obj.background
  obj._ = obj.color

  Object.defineProperty obj, 'rainbow',
    enumerable: true
    configurable: true
    get: ->
      newStyles = [_rainbow].concat prevStyles
      f = makeStyleFunc newStyles
      f.__doc__ = """Applies rainbow styling to the crayon!"""
      delete obj.rainbow
      obj.rainbow = f

  obj.color.__doc__ = """Applies any styles and colors you pass in; accepts multiple arguments"""
  obj.foreground.__doc__ = """Sets the foreground color for the crayon"""
  obj.background.__doc__ = """Sets the background color for the crayon"""
  obj.fgbg.__doc__ = """Takes two arguments -- a foreground color and a background color -- and applies those styles to the crayon"""

styleFunc = (begin, end) -> (s) -> begin + s + end

makeStyleFunc = (styles) ->
  """Returns a function that applies a list of styles

    Styles are encoded using an Array of functions"""

  f = (args...) ->

    s = util.format args...
    if crayon.enabled
      for style in styles
        s = style s
    s

  addColorFuncs f, styles

  for level in logLevels
    do (level) ->
      f[level] = (args...) ->
        crayon.logger[level] f util.format args...

  f

getColorNumber = (desc) ->
  num = ansi256css desc
  unless num?
    throw new Error "Don't understand the color '#{ desc }'"
  num

foregroundCode = (number) -> styleFunc '\u001b[38;5;' + number + 'm', '\u001b[39m'
backgroundCode = (number) -> styleFunc '\u001b[48;5;' + number + 'm', '\u001b[49m'

ansiStyle = (desc) ->
  re = /^(bg|background):?/i
  unless re.test desc
    foregroundCode getColorNumber desc
  else
    backgroundCode getColorNumber desc.replace(re, '')

splitFlatten = (list) ->
  """Turns something like ['red blue', 'white'] into ['red', 'blue', 'white']"""
  split = (x) ->
    if typeof x is 'string'
      x.split /\s+/
    else
      [x]
  [].concat.apply [], (split x for x in list)

general = (styles...) ->
  t = (x) ->
    if codes[x]?
      styleFunc codes[x]...
    else
      ansiStyle x
  (t x for x in splitFlatten(styles).reverse())

module.exports = crayon = (styles...) -> makeStyleFunc general styles...

addColorFuncs crayon, []

crayon.supportsColor = hasColor
crayon.stripColor = stripAnsi

unless crayon.enabled?
  crayon.enabled = hasColor

unless crayon.logger?
  crayon.logger = console

# Add the logging functions from the logger as properties on here so that
# if the logger changes, you get different values for these
for level in logLevels
  do (level) ->
    Object.defineProperty crayon, level,
      enumerable: true
      configurable: true
      get: ->
        crayon.logger[level]

# For rough compatibility with the API of jharding's crayon module
# that is currently "crayon" in npm. (https://github.com/jharding/crayon)
Object.defineProperty crayon, 'success',
  enumerable: true
  configurable: true
  get: ->
    crayon.logger?.success ? (args...) ->
      crayon.green.log args...

crayon.palette = ->
  """Displays all the colors"""
  crayon.log crayon.inverse (crayon(i)("  #{ if i in VERY_DARK_COLORS then crayon.bgWhite i else i }  ") for i in [0...256]).join ''

crayon.__doc__ = require('fs').readFileSync __dirname + '/README.md', 'utf8'
pkg = require './package'
crayon.version = pkg.version

crayon.splitFlatten = splitFlatten


