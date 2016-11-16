fuzzy-predicate
============
Filter an array of objects (or an array of just about anything) down to only include those objects with properties _somewhat_ matching the provided query.

	var fuzzy = require("fuzzy-predicate");
	
	var data = [
		{
			name: "Dan Smith"
		},
		{
			name: "Issac Long"
		}
	];
	
	var result = data.filter(fuzzy("dan"));
	
	console.log(result);
	// [{
	// 		name: "Dan Smith"
	// }]

Installation
------------
	npm install fuzzy-predicate --save

Usage
------------

### 1. Import the library
	var fuzzy = require("fuzzy-predicate");

### 2. Generate a predicate
	// where "apple" is the data you're looking for
	var predicate = fuzzy("apple");

### 3. Use the predicate to filter an array
	var result = myArray.filter(predicate);

`result` now contains only the elements in `myArray` that _somewhat_ match the query ("apple").

`myArray` could have been an array of strings, an array of numbers, an array of objects, or even an array of arrays. `fuzzy-predicate` will recursively search through all the data trying to find something that matches the original query.

Example
------------
`fuzzy-predicate` is an ideal tool for using user input to filter a response from a Web service. Let's say you have an array of objects that each represent a user and you wanted to find user(s) named "John":

	var fuzzy = require("fuzzy-predicate");
	
	var data = [
		{
			id: "7128792",
			name: "John Doe",
			mail: "jdoe@example.com",
			twitter: "john_doe"
		},
		{
			id: "1203922",
			name: "Jane Doe",
			mail: "jane.doe@example.com",
			twitter: "grannysmithapple"
		},
		{
			id: "9189701",
			name: "Dan Smith",
			mail: "dan.smith@example.com",
			twitter: "javascripz",
		}
	];

	var result = data.filter(fuzzy("john"));
	
In this scenario, `result` would be an array containing a single element:

	{
		id: "7128792",
		name: "John Doe",
		mail: "jdoe@example.com",
		twitter: "john_doe"
	}

But what if the query was "smith"?

	var result = data.filter(fuzzy("smith"));

`result` would contain two elements:

	{
		id: "1203922",
		name: "Jane Doe",
		mail: "jane.doe@example.com",
		twitter: "grannysmithapple"
	},
	{
		id: "9189701",
		name: "Dan Smith",
		mail: "dan.smith@example.com",
		twitter: "javascripz",
	}

When searching for "smith," `fuzzy-predicate` found a match in the Twitter handle for Jane, and the name (and email) property for Dan. 

Perhaps we only wanted to find people with a _name_ matching "Smith":

	var result = data.filter(fuzzy("smith", ["name"]));
	
This time, `result` would contain only one element:

	{
		id: "9189701",
		name: "Dan Smith",
		mail: "dan.smith@example.com",
		twitter: "javascripz",
	}	


Documentation
------------

**fuzzy(query, keys)**  
Returns a filter predicate (function) suitable for passing to [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

* `query`: The filter query to use to reduce an array down to objects matching the query. This can be a string or a number.
* `keys`: Optionally restrict the search to a set of keys; only applied when filtering objects. This can be a string containing the name of a single key, or an array of keys.

### Normalization
What makes this a "fuzzy" filter is that it is looking for values that _somewhat_ match the query—not exact matches.

When comparing strings, the needle (the query) and the haystack value are both normalized following these rules:

1. Convert the string to a lowercase string
2. Remove all non-word characters (characters matching the `\W` regex and underscores)

Then, instead of checking string equality, it checks to see if the haystack value contains the needle value (using `indexOf`). If it does, it's considered a match.

This process only applies when comparing strings; numbers must be exactly equal to be considered a match.

License
------------
See LICENSE.

Contributing
------------
I welcome pull requests containing bug fixes and documentation improvements for `fuzzy-predicate`. Be sure to run the tests before submitting any changes.

And although I consider `fuzzy-predicate` to be _mostly_ feature complete, I welcome discussion on how it could be a more useful tool (e.g. if callers could customize how normalization worked).