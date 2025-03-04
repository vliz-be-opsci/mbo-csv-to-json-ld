# Approximate approach to ISO8601 start/end date ranges

See <https://en.wikipedia.org/wiki/ISO_8601#Time_intervals> for the more formal spec.

N.B. There is support for ranges which ommit closing range information, e.g. `2007-12-14T13:30/15:30`, but this regex doesn't support those either. It only supports fully specified ranges on both parts of the interval at the moment.

A regex can never be made to fully represent ISO8601 time intervals, so this is just a best reasonable effort to provide some limited amount of data validation.

We do however support the open-ended ranges specified on schema.org:

>  Open-ended date ranges can be written with ".." in place of the end date. For example, "2015-11/.." indicates a range beginning in November 2015 and with no specified final date. This is tentative and might be updated in future when ISO 8601 is officially updated. Supersedes datasetTimeInterval. 
> https://schema.org/temporalCoverage

## TIME:

```
T[0-2][0-9](
    :?[0-5][0-9](
        :?[0-5][0-9](\\.\\d+)?
    )?
)?
(
    Z | (
        [+-][0-2][0-9](
            :?[0-5][0-9]
        )?
    )
)?
```

Summary: `T[0-2][0-9](:?[0-5][0-9](:?[0-5][0-9](\\.\\d+)?)?)?(Z|([+-][0-2][0-9](:?[0-5][0-9])?))?`

## DATE

```
[+-]?\\d{4}(
    (-?
        (-?
            (W[0-5][0-9]|[0-1][0-9]) |
            ([0-3][0-9][0-9]) |
            (
                (W[0-5][0-9]-?[0-7]|[0-3][0-9][0-9]|[0-1][0-9]-?[0-3][0-9])
                (TIME)?
            )
        )
    )?
)?
```

Summary: `[+-]?\\d{4}((-?(-?(W[0-5][0-9]|[0-1][0-9])|([0-3][0-9][0-9])|((W[0-5][0-9]-?[0-7]|[0-3][0-9][0-9]|[0-1][0-9]-?[0-3][0-9])(TIME)?)))?)?`

Materialised summary: `[+-]?\\d{4}((-?(-?(W[0-5][0-9]|[0-1][0-9])|([0-3][0-9][0-9])|((W[0-5][0-9]-?[0-7]|[0-3][0-9][0-9]|[0-1][0-9]-?[0-3][0-9])(T[0-2][0-9](:?[0-5][0-9](:?[0-5][0-9](\\.\\d+)?)?)?(Z|([+-][0-2][0-9](:?[0-5][0-9])?))?)?)))?)?`

## START/END DATETIME RANGE

```
(DATE)/(
    \\.\\.|DATE
)
````

Summary: `(DATE)/(\\.\\.|DATE)`

Materialised summary: `([+-]?\\d{4}((-?(-?(W[0-5][0-9]|[0-1][0-9])|([0-3][0-9][0-9])|((W[0-5][0-9]-?[0-7]|[0-3][0-9][0-9]|[0-1][0-9]-?[0-3][0-9])(T[0-2][0-9](:?[0-5][0-9](:?[0-5][0-9](\\.\\d+)?)?)?(Z|([+-][0-2][0-9](:?[0-5][0-9])?))?)?)))?)?)/(\\.\\.|[+-]?\\d{4}((-?(-?(W[0-5][0-9]|[0-1][0-9])|([0-3][0-9][0-9])|((W[0-5][0-9]-?[0-7]|[0-3][0-9][0-9]|[0-1][0-9]-?[0-3][0-9])(T[0-2][0-9](:?[0-5][0-9](:?[0-5][0-9](\\.\\d+)?)?)?(Z|([+-][0-2][0-9](:?[0-5][0-9])?))?)?)))?)?)`