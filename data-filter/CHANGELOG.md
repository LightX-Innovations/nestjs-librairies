# DataFilter - Change log

All notable changes to the @recursyve/nestjs-data-filter project will be documented in this file. (starting from the 8.0.0 version)

## [8.0.0] - 2022-02-05

### Added

- Upgrade @nestjs dependencies to 8.x.x

### Changed

- Added support for the new access control structure of @recursyve/nestjs-access-control

## [8.1.0] - 2022-03-04

### Added

- Support for JSON column in filters [#43](https://github.com/Recursyve/nestjs-librairies/pull/43)

## [8.1.2] - 2022-04-04

### Changed
 
- Condition in filter configuration now accept a function as a value to allow the runtime rule value to used instead of juste a *hardcoded* value

## [8.1.3] - 2022-04-11

### Changed
 
- Update typings for SelectFilter getResourceById

## [8.2.0] - 2022-04-12

### Changed

- Filter config can now receive the Http Request in parameters

### Breaking changes
 
- Update SelectFilter `values` and `getResourceById` definition to accept request in parameters

#### Before
```typescript
SelectFilter({
    id: "test",
    values: (value, user) => Promise.resolve([]),
    getResourceById: (id, user) => Promise.resolve({ id: "test", name: "TEST!" })
})
```

#### After

```typescript
SelectFilter({
    id: "test",
    values: ({ value, user, req }) => Promise.resolve([]),
    getResourceById: ({ id, user, req }) => Promise.resolve({ id: "test", name: "TEST!" })
})
```

## [8.2.1] - 2022-04-12

### Bugfix

- Fix FilterController call to the FilterService

## [8.2.3] - 2022-04-15

### Added

- Support of FindAttributeOptions in @Attributes instead of just an array

## [8.3.0] - 2022-04-19

### Changed

- Update the minimal required Sequelize version to 6.19.0

## [8.3.1] - 2022-04-28

### Added

- Added findOneFromUser in DataFilterRepository

## [8.3.2] - 2022-04-30

### Bugfix

- Fix an issue with the DataFilterRepository search when a where condition is passed, but without an `[Op.and]` as root condition  

## [8.3.4] - 2022-05-12

### Changed

- You can now order by more than one column with Filters
- You can now use two different columns for latitude and longitude with the `@Distance` custom attributes.

## [8.3.6] - 2022-05-24

### Bugfix

- Fix order by custom column with filters
- Fix an issue with the GeoBoundsFilter when using the srid config 


## [8.3.7] - 2022-05-25

### Bugfix

- Fix for custom attribute column when using nullLast

## [8.4.0] - 2022-06-07

### Added

- You can now disable a filter by setting the disabled function in the filter config

## [8.4.5] - 2022-07-05

### Added

- Added DateOnlyFilter for `DATEONLY` columns


## [8.4.7] - 2022-07-26

### Bugfix

- Fix attributes not merging correctly with `@Include`

## [8.4.8] - 2022-07-29

### Bugfix

- Fix empty attributes array in `@Include` not adding the `id` by default


## [8.5.0] - 2022-08-23

### Added

- Added `IfOrderRule` to generate `If(...)` order rule for MySQL
- Added default order in base filter

## [8.5.1] - 2022-09-17

### Bugfix

- Fix `IfOrderRule` possible ambiguous column name


## [8.5.2] - 2022-10-5

### Added

- Added `exportRepository` in BaseFilter to defined a custom DataDefinition for when downloading data.

## [8.5.3] - 2022-11-02

### Bugfix

- Fix issues caused by the `exportRepository`

## [8.5.4] - 2022-11-16

### Bugfix

- Fix issues with OrderRules


## [8.5.5] - 2022-10-01

### Bugfix

- Fix issues with RadioFilter conditions in options


## [8.5.6] - 2023-01-04

### Bugfix

- Fix for strict typings


## [8.7.0] - 2023-01-25

### Improvements

- Fix include generations


## [8.8.0] - 2023-02-01

### Added

- Added `IsNullOrderRule` to order by `IS NULL`
- Added limit in `@Path` and `@Include`
- Added `@Limit` decorator

## [8.8.1] - 2023-02-01

### Bugfix

- Fix issue where include for `defaultOrder` would not be generated

## [8.8.4] - 2023-03-15

### Bugfix

- Fix issue where include for `RadioFilter` conditions in options would generate properly.


## [8.9.0] - 2023-06-19

### Added

- Added `@Count` and `@Sum` decorators.

## [8.9.1] - 2023-06-20

### Added

- Added more options for `@Count` and `@Sum` decorators.


## [8.9.2] - 2023-06-20

### Bugfix

- Fix issue with the groupBy options of the FilterQueryModel.


## [9.0.0] - 2023-01-02

### Added

- Upgrade @nestjs dependencies to 9.x.x

## [9.0.1] - 2023-01-04

### Bugfix

- Fix for strict mode

## [9.1.0]

### Added

- Added `IsNullOrderRule` to order by `IS NULL`
- Added limit in `@Path` and `@Include`
- Added `@Limit` decorator

### Improvements

- Fix include generations

### Bugfix

- Fix issue where include for `defaultOrder` would not be generated
- Fix issue where include for `RadioFilter` conditions in options would generate properly.

## [9.1.1] - 2023-04-14

### Bugfix

- Fix issue with `IsNull` and `IsNotNull` operators for DateFilter.


## [9.1.2] - 2023-04-14

### Bugfix

- Fix issue with multiple operators for DateFilter.

## [9.2.0]

## Breaking changes
- 
- Update typings of findByPk and findOne to match Sequelize Typings.

### Added

- Added `@Count` and `@Sum` decorators.

### Bugfix

- Fix issue with the groupBy options of the FilterQueryModel.

## [9.2.1]

### Bugfix

- Fix performance issues with the filter count feature.


## [9.2.2]

### Bugfix

- Fix nullLast option for DESC ordering

## [9.3.0]

### Improvements

- Update typings for @Data

## [9.3.1]

### Bugfix

- Fix issues with filters from json columns

## [9.3.2] - 2023-11-22

### Bugfix

-  Fix issues with filter group and count with joins

## [9.3.2] - 2024-04-04

### Bugfix

-  Fix issues with date time filters with a path
