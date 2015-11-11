// The MIT License (MIT)
//
// Copyright (c) 2014 Jonas Finnemann Jensen
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var slugid  = require('./slugid');
var uuid    = require('uuid');

/**
 * Test that we can correctly encode a "non-nice" uuid (with first bit set) to
 * its known slug. The specific uuid was chosen since it has a slug which
 * contains both `-` and `_` characters.
 */
exports.encodeTest = function(test) {
  test.expect(1);

  // 10000000010011110011111111001000110111111100101101001011000001101000100111111011101011101111101011010101111000011000011101010100....
  // <8 ><0 ><4 ><f ><3 ><f ><c ><8 ><d ><f ><c ><b ><4 ><b ><0 ><6 ><8 ><9 ><f ><b ><a ><e ><f ><a ><d ><5 ><e ><1 ><8 ><7 ><5 ><4 >
  // < g  >< E  >< 8  >< _  >< y  >< N  >< _  >< L  >< S  >< w  >< a  >< J  >< -  >< 6  >< 7  >< 6  >< 1  >< e  >< G  >< H  >< V  >< A  >
  var uuid_ = '804f3fc8-dfcb-4b06-89fb-aefad5e18754';
  var expectedSlug = "gE8_yN_LSwaJ-6761eGHVA";

  // Encode
  var actualSlug = slugid.encode(uuid_);

  // Test that it encoded correctly
  test.ok(expectedSlug == actualSlug, "UUID not correctly encoded into slug: '" + expectedSlug + "' != '" + actualSlug + "'");

  test.done();
};

/**
 * Test that we can decode a "non-nice" slug (first bit of uuid is set) that
 * begins with `-`
 */
exports.decodeTest = function(test) {
  test.expect(1);

  // 11111011111011111011111011111011111011111011111001000011111011111011111111111111111111111111111111111111111111111111111111111101....
  // <f ><b ><e ><f ><b ><e ><f ><b ><e ><f ><b ><e ><4 ><3 ><e ><f ><b ><f ><f ><f ><f ><f ><f ><f ><f ><f ><f ><f ><f ><f ><f ><d >
  // < -  >< -  >< -  >< -  >< -  >< -  >< -  >< -  >< Q  >< -  >< -  >< -  >< _  >< _  >< _  >< _  >< _  >< _  >< _  >< _  >< _  >< Q  >
  var slug = '--------Q--__________Q';
  var expectedUuid = "fbefbefb-efbe-43ef-bfff-fffffffffffd";

  // Decode
  var actualUuid = slugid.decode(slug);

  // Test that it is decoded correctly
  test.ok(expectedUuid == actualUuid, "Slug not correctly decoded into uuid: '" + expectedUuid + "' != '" + actualUuid + "'");

  test.done();
}

/**
 * Test that 100 v4 uuids are unchanged after encoding and then decoding them
 */
exports.uuidEncodeDecodeTest = function(test) {
  test.expect(100);

  for (i = 0; i < 100; i++) {
    // Generate uuid
    var uuid_ = uuid.v4();

    // Encode
    var slug = slugid.encode(uuid_);

    // Test that decode uuid matches original
    test.ok(slugid.decode(slug) == uuid_, "Encode and decode isn't identity");
  }

  test.done();
};

/**
 * Test that 100 v4 slugs are unchanged after decoding and then encoding them.
 */
exports.slugDecodeEncodeTest = function(test) {
  test.expect(100);

  for (i = 0; i < 100; i++) {
    // Generate slug
    var slug1 = slugid.v4();

    // Decode
    var uuid_ = slugid.decode(slug1);

    // Encode
    var slug2 = slugid.encode(uuid_);

    // Test that decode uuid matches original
    test.ok(slug1 == slug2, "Decode and encode isn't identity");
  }

  test.done();
};

/**
 * Test: Make sure that all allowed characters can appear in all allowed
 * positions within the "nice" slug. In this test we generate over a thousand
 * slugids, and make sure that every possible allowed character per position
 * appears at least once in the sample of all slugids generated. We also make
 * sure that no other characters appear in positions in which they are not
 * allowed.
 *
 * base 64 encoding char -> value:
 * ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_
 * 0         1         2         3         4         5          6
 * 0123456789012345678901234567890123456789012345678901234567890123
 *
 * e.g. from this we can see 'j' represents 35 in base64
 *
 * The following comments show the 128 bits of the v4 uuid in binary, hex and
 * base 64 encodings. The 6 fixed bits (`0`/`1`) according to RFC 4122, plus
 * the first (most significant) fixed bit (`0`) are shown among the 121
 * arbitrary value bits (`.`/`x`). The `x` means the same as `.` but just
 * highlights which bits are grouped together for the respective encoding.
 *
 * schema:
 *      <..........time_low............><...time_mid...><time_hi_+_vers><clk_hi><clk_lo><.....................node.....................>
 *
 * bin: 0xxx............................................0100............10xx............................................................
 * hex:  $A <01><02><03><04><05><06><07><08><09><10><11> 4  <13><14><15> $B <17><18><19><20><21><22><23><24><25><26><27><28><29><30><31>
 *
 * => $A in {0, 1, 2, 3, 4, 5, 6, 7} (0b0xxx)
 * => $B in {8, 9, A, B} (0b10xx)
 *
 * bin: 0xxxxx..........................................0100xx......xxxx10............................................................xx0000
 * b64:   $C  < 01 >< 02 >< 03 >< 04 >< 05 >< 06 >< 07 >  $D  < 09 >  $E  < 11 >< 12 >< 13 >< 14 >< 15 >< 16 >< 17 >< 18 >< 19 >< 20 >  $F
 *
 * => $C in {A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, a, b, c, d, e, f} (0b0xxxxx)
 * => $D in {Q, R, S, T} (0b0100xx)
 * => $E in {C, G, K, O, S, W, a, e, i, m, q, u, y, 2, 6, -} (0bxxxx10)
 * => $F in {A, Q, g, w} (0bxx0000)
 */
exports.niceSpreadTest = function(test) {
  var charsAll = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split('').sort().join('');
  // 0 - 31: 0b0xxxxx
  var charsC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef".split('').sort().join('');
  // 16, 17, 18, 19: 0b0100xx
  var charsD = "QRST".split('').sort().join('');
  // 2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62: 0bxxxx10
  var charsE = "CGKOSWaeimquy26-".split('').sort().join('');
  // 0, 16, 32, 48: 0bxx0000
  var charsF = "AQgw".split('').sort().join('');
  expected = [charsC, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsD, charsAll, charsE, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsF];
  spreadTest(
    test,
    function() {
      return slugid.nice();
    },
    expected
  );
}

/**
 * This test is the same as niceSpreadTest but for slugid.v4() rather than
 * slugid.nice(). The only difference is that a v4() slug can start with any of
 * the base64 characters since the first six bits of the uuid are random.
 */
exports.v4SpreadTest = function(test) {
  var charsAll = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split('').sort().join('');
  // 16, 17, 18, 19: 0b0100xx
  var charsD = "QRST".split('').sort().join('');
  // 2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62: 0bxxxx10
  var charsE = "CGKOSWaeimquy26-".split('').sort().join('');
  // 0, 16, 32, 48: 0bxx0000
  var charsF = "AQgw".split('').sort().join('');
  expected = [charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsD, charsAll, charsE, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsAll, charsF];
  spreadTest(
    test,
    function() {
      return slugid.v4();
    },
    expected
  );
}

/**
 * `spreadTest` runs a test against the `generator` function, to check that
 * when calling it 64*40 times, the range of characters per string position it
 * returns matches the array `expected`, where each entry in `expected` is a
 * string of all possible characters that should appear in that position in the
 * string, at least once in the sample of 64*40 responses from the `generator`
 * function */
function spreadTest(test, generator, expected) {
  // k records which characters were found at which positions. It has one entry
  // per slugid character, therefore 22 entries. Each entry is an object with
  // a property for each character found, where the value of that property is
  // the number of times that character appeared at that position in the slugid
  // in the large sample of slugids generated in this test.
  var k = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

  test.expect(1);

  // Generate a large sample of slugids, and record what characters appeared
  // where...  A monte-carlo test has demonstrated that with 64 * 20
  // iterations, no failure occurred in 1000 simulations, so 64 * 40 should be
  // suitably large to rule out false positives.
  for (i = 0; i < 64 * 40; i++) {
    var slug = generator();
    for (j = 0; j < slug.length; j++) {
      if (k[j][slug.charAt(j)] === undefined) {
        k[j][slug.charAt(j)] = 1
      } else {
        k[j][slug.charAt(j)]++;
      }
    }
  }

  // Compose results into an array `actual`, for comparison with `expected`
  var actual = [];
  for (j = 0; j < k.length; j++) {
    a = Object.keys(k[j])
    actual[j] = ""
    for (x = 0; x < a.length; x++) {
      if (k[j][a[x]] > 0) {
        actual[j] += a[x]
      }
    }
    // sort for easy comparison
    actual[j] = actual[j].split('').sort().join('');
  }

  test.ok(arraysEqual(expected, actual), "In a large sample of generated slugids, the range of characters found per character position in the sample did not match expected results.\n\nExpected: " + expected + "\n\nActual: " + actual)
  test.done();
}

/**
 * `arraysEqual` checks arrays `a` and `b` for equality
 */
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
