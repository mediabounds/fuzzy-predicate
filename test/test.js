var assert = require("assert");
var fuzzy = require("../");

describe("fuzzy-predicate", function() {
  describe("predicate generation", function() {
    it("only allows strings or numbers as the query", function() {
      assert.doesNotThrow(function() {
        fuzzy("valid query");
      }, TypeError);

      assert.doesNotThrow(function() {
        fuzzy(42);
      }, TypeError);

      assert.throws(function() {
        fuzzy([]);
      }, TypeError);

      assert.throws(function() {
        fuzzy({});
      }, TypeError);

      assert.throws(function() {
        fuzzy(NaN);
      }, TypeError);

      assert.throws(function() {
        fuzzy();
      }, TypeError);
    });

    it("only allows strings or arrays as keys", function() {
      assert.doesNotThrow(function() {
        fuzzy("anything", "string");
      }, TypeError);

      assert.doesNotThrow(function() {
        fuzzy("anything", ["array", "of", "string"]);
      }, TypeError);

      assert.throws(function() {
        fuzzy("anything", 42);
      }, TypeError);

      assert.throws(function() {
        fuzzy("anything", {});
      }, TypeError);

      assert.throws(function() {
        fuzzy("anything", NaN);
      }, TypeError);
    });

    it("allows predicate to be used multiple times", function() {
      var predicate = fuzzy("foo");

      var results = ["food", "foo", "bar"].filter(predicate);
      assert.deepStrictEqual(results, ["food", "foo"]);

      results = ["food", "is", "delicious"].filter(predicate);
      assert.deepStrictEqual(results, ["food"]);
    });
  });

  context("given an array of an assortment of JavaScript types", function() {
    // Test the various types of return values returned by typeof
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
    var haystack = [
      undefined,
      null,
      true,
      42,
      "42",
      function() {},
      {}
    ];

    it("successfully finds matches for the specified query", function() {
      var result = haystack.filter(fuzzy(42));
      assert.deepStrictEqual(result, [42, "42"]);
    });
  });

  context("given an array of strings", function() {
    var haystack = [
      "John Doe",
      "To John Doe",
      "jdoe",
      "john-doe",
      "Jane Smith",
      "DOE, JOHN"
    ];

    it("matches strings containing the query", function() {
      var results = haystack.filter(fuzzy("Jane"));
      assert.deepStrictEqual(results, ["Jane Smith"]);
    });

    it("ignores spacing, punctuation, and capitalization", function() {
      var results = haystack.filter(fuzzy("Doe"));
      assert.deepStrictEqual(results, ["John Doe", "To John Doe", "jdoe", "john-doe", "DOE, JOHN"]);

      results = haystack.filter(fuzzy("John Doe"));
      assert.deepStrictEqual(results, ["John Doe", "To John Doe", "john-doe"]);

      results = haystack.filter(fuzzy("JOHN_DOE"));
      assert.deepStrictEqual(results, ["John Doe", "To John Doe", "john-doe"]);
    });
  });

  context("given an array of numbers", function() {
    var haystack = [
      4,
      42,
      420,
      444
    ];

    it("only returns exact matches", function() {
      var results = haystack.filter(fuzzy(4));
      assert.strictEqual(1, results.length);
      assert.strictEqual(4, results[0]);
    });

    it("still matches against a string query", function() {
      var results = haystack.filter(fuzzy("4"));
      assert.strictEqual(1, results.length);
      assert.strictEqual(4, results[0]);
    });
  });

  context("given an array of objects", function() {
    var haystack = [
      {
        id: "abc123",
        name: "Foo Bar",
        age: 42
      },
      {
        id: "abc420",
        name: "John Doe",
        age: 1234
      },
      {
        foo: "bar"
      },
      {
        bar: "foo"
      },
      {
        key: "I-Would_eat!FOOD*42/times+per{day}"
      }
    ];

    it("iterates the objects' properties to find matches", function() {
      var results = haystack.filter(fuzzy("foo"));
      var expectedResults = [
        {
          id: "abc123",
          name: "Foo Bar",
          age: 42
        },
        {
          bar: "foo"
        },
        {
          key: "I-Would_eat!FOOD*42/times+per{day}"
        }
      ];
      assert.deepStrictEqual(results, expectedResults);

      results = haystack.filter(fuzzy("42"));
      expectedResults = [
        {
          id: "abc123",
          name: "Foo Bar",
          age: 42
        },
        {
          id: "abc420",
          name: "John Doe",
          age: 1234
        },
        {
          key: "I-Would_eat!FOOD*42/times+per{day}"
        }
      ];
      assert.deepStrictEqual(results, expectedResults);
    });

    it("only searches properties exactly matching the name of specified keys (if provided)", function() {
      var results = haystack.filter(fuzzy("foo", "name"));
      assert.deepStrictEqual(results, [{
        id: "abc123",
        name: "Foo Bar",
        age: 42
      }]);

      results = haystack.filter(fuzzy("foo", ["name", "bar"]));
      assert.deepStrictEqual(results, [
        {
          id: "abc123",
          name: "Foo Bar",
          age: 42
        },
        {
          bar: "foo"
        }
      ]);
    });
  });

  context("given an array of mixed values", function() {
    var haystack = [
      {
        id: "abc123",
        name: "Foo Bar",
        age: 42
      },
      {
        id: "abc420",
        name: "John Doe",
        age: 1234
      },
      {
        foo: "bar"
      },
      {
        bar: "foo"
      },
      {
        key: "I-Would_eat!FOOD*42/times+per{day}"
      },
      "John Doe",
      "john-doe",
      "jdoe",
      "Jane Smith",
      42,
      4,
      "420",
      "4JOHN2DOE!",
      ["john", "doe", "is 42"]
    ];

    it("searches each value for a match based on previously defined rules", function() {
      var results = haystack.filter(fuzzy("john_doe"));
      var expectedResults = [
        {
          id: "abc420",
          name: "John Doe",
          age: 1234
        },
        "John Doe",
        "john-doe"
      ];
      assert.deepStrictEqual(results, expectedResults);

      results = haystack.filter(fuzzy("42"));
      expectedResults = [
        {
          id: "abc123",
          name: "Foo Bar",
          age: 42
        },
        {
          id: "abc420",
          name: "John Doe",
          age: 1234
        },
        {
          key: "I-Would_eat!FOOD*42/times+per{day}"
        },
        42,
        "420",
        ["john", "doe", "is 42"]
      ];
      assert.deepStrictEqual(results, expectedResults);

      results = haystack.filter(fuzzy(4));
      expectedResults = [
        {
          id: "abc420",
          name: "John Doe",
          age: 1234
        },
        {
          key: "I-Would_eat!FOOD*42/times+per{day}"
        },
        4,
        "420",
        "4JOHN2DOE!",
        ["john", "doe", "is 42"]
      ];
      assert.deepStrictEqual(results, expectedResults);
    });
  });
});
