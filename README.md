# eServices API
API of eServices. This handles the database entries, storing data, API part itself, so on. Certain actions are public, like viewing the documents, and some, like creating or deleting documents, require a TOKEN.

To create tokens, you need to manually add them to the database!
You also have to set up the database manually.
This uses PostgreSQL.

Enter your database info in `db.js`.

## Database schemas

### tokens
```
      Column       |          Type          | Collation | Nullable | Default 
-------------------+------------------------+-----------+----------+---------
 token             | character varying(255) |           | not null | 
 country           | character varying(255) |           |          | 
 passportsvalidfor | integer                |           |          | 
Indexes:
    "tokens_pkey" PRIMARY KEY, btree (token)
```

### players
```
  Column  |          Type          | Collation | Nullable | Default 
----------+------------------------+-----------+----------+---------
 username | character varying(255) |           | not null | 
 discord  | character varying(255) |           |          | 
Indexes:
    "players_pkey" PRIMARY KEY, btree (username)
```

### passports
```
  Column  |           Type           | Collation | Nullable |      Default       
----------+--------------------------+-----------+----------+--------------------
 id       | integer                  |           | not null | 
 isvalid  | boolean                  |           | not null | 
 player   | character varying(255)   |           | not null | 
 country  | character varying(255)   |           | not null | 
 issuedon | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 expires  | date                     |           |          | CURRENT_DATE + 180
 issuedby | character varying(255)   |           | not null | 
 place    | character varying(255)   |           |          | 
Indexes:
    "passports_pkey" PRIMARY KEY, btree (id)
```
