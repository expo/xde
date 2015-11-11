__doc__ = """
A module that returns an ANSI color code given either a CSS color name, a hex string,
or an ANSI color code as a number

"""

cssToAnsi = require './css-to-ansi'

fromHex = (hex) ->
  """Maps a 6 digit hex string describing a CSS color onto the ANSI 256 color palette"""

  [red, green, blue] = (Math.round(parseInt(x, 16) / 255 * 5) for x in [hex[0...2], hex[2...4], hex[4...6]])
  16 + red * 36 + green * 6 + blue

module.exports = (code) ->
  """Returns an ANSI color number given an ANSI color number, CSS color name, or CSS hex color"""

  switch typeof code
    when 'number' then code
    when 'string'
      if /^#?(?:[0-9a-f]{3}){1,2}$/i.test code
        if code[0] == '#'
          code = code[1...]
        if code.length < 6
          fromHex code[0] + code[0] + code[1] + code[1] + code[2] + code[2]
        else
          fromHex code
      else
        cssToAnsi[code.toLowerCase()]
    else
      undefined


