# Spreadsheet

Spreadsheet is an Obsidian plugin which follows the Obsidian mindset of open-standards and supports rich spreadsheet
handling through CSV.

## Usage

A spreadsheet is any CSV document in your vault. Front matter is also supported natively. The following properties are
understood:

| property                    | type              | function                                                                                                                                                                                            |
|-----------------------------|:------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `columnTypes`               | typeName[]        | Allows constraining a column to a particular type. [All types](#types)                                                                                                                              |
| `columnTitles`              | string[]          | Gives each column a name. If this property is omitted, it will be inferred to be the first row in the CSV document. Upon saving, this value will be moved into the frontmatter of the CSV document. |                         
| `constrainToDefinedColumns` | 'true' or 'false' | If true, discards values without a `columnTitle`                                                                                                                                                    |
| `allowedTypes`              | typeName[]        | A list of [custom types](#custom-types) which are permitted in the document                                                                                                                         |
| `columnSeparator`           | string            | A string which separates columns. If not defined, will attempt to detect either `,` or `;`. This value is written to the front matter when the document is saved.                                   |

## Types

A spreadsheet is designed to allow working with various data formats. This spreadsheet handler natively supports the following types:

* raw text
* rich text (markdown)
* formulas
* dates
* values with units
* 

### Custom Types