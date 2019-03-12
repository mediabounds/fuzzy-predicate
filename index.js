var StringSimilarity = require ('string-similarity')

module.exports = fuzzy;

/**
 * Filter an array of objects (or an array of just about anything) down
 * to only include those objects with properties somewhat matching the provided query.
 *
 * A "fuzzy" match...
 *  - matches any string that contains the query being insensitive to punctuation, spacing, and capitalization
 *  - matches numbers exactly
 *  - matches objects who contains a value fuzzy-matching the query
 *  - if similarity threshold is set, then it does a truly fuzzy match by comparing the difference in the strings
 *
 * When filtering an array of objects, the fuzzy matching can optionally be restricted to only
 * match values that are associated with the specified key or keys.
 *
 * @param  {string|number} query The filter query to use to reduce an array down to objects matching the query.
 * @param  {string|array=} keys Optionally restrict the search to a set of keys; only applied when filtering objects.
 * @param  {number} threshold Returns a fraction between 0 and 1, which indicates the degree of similarity between the two strings. 
 *                  0 indicates completely different strings, 1 indicates identical strings.
 *
 * @return {Function} A filter predicate suitable for passing to Array.prototype.filter.
 */
function fuzzy(query, keys, threshold) {
  if (typeof query !== "string" &&
    (typeof query !== "number" || isNaN(query))) {
    throw new TypeError("The query is required and must be a string or number");
  }

  if (typeof keys === "undefined") {
    keys = [];
  } else if (typeof keys === "string") {
    keys = [keys];
  } else if (typeof keys === "number") {
    threshold = keys;
    keys = [];
  } else if (!Array.isArray(keys)) {
    throw new TypeError("keys should either be an array or a single value as a string");
  }

  return function(element) {
    return _search(element, query, keys, threshold);
  };
}

/**
 * Recursively searches through a haystack to find the specified needle.
 *
 * @param  {*} haystack Searches this object for the needle.
 * @param  {string|number} needle The value to search for within the haystack.
 * @param  {array} keys Restrict searching an object to only match values associated with the specified keys.
 * @param  {number} leven Use levenshtein distance to determine if the match is acceptable
 *
 * @return {boolean} True if a match was found; false otherwise.
 */
function _search(haystack, needle, keys, threshold) {
  switch (typeof haystack) {
    case "number":
      return haystack == needle; // eslint-disable-line eqeqeq
    case "string":
      if (!!threshold) { 
          return StringSimilarity.compareTwoStrings(_normalize(haystack), (_normalize(needle))) >= threshold;
      } else {
          return _normalize(haystack).indexOf(_normalize(needle)) >= 0;
      }
    case "object":
      for (var key in haystack) {
        if (haystack.hasOwnProperty(key) && (keys.length === 0 || keys.indexOf(key) >= 0)) {
          if (_search(haystack[key], needle, keys, threshold)) {
            return true;
          }
        }
      }
      return false;
    default:
      return false;
  }
}

/**
 * Normalizes a value.
 *
 * Converts strings to lower case and removes all punctuation and spacing.
 * For all other values, it simply returns the passed-in value without modification.
 *
 * @param  {*} value The value to normalize.
 *
 * @return {*} The normalized value.
 */
function _normalize(value) {
  if (value.toLowerCase) {
    return value.toLowerCase().replace(/[\W_]/g, "");
  }

  return value;
}
