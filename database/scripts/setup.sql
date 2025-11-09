use template_db;

create table if not exists educational_facility
(
    id int auto_increment comment 'Primary Key'
        primary key,
    unique_id varchar(100) unique not null,
    facility_name varchar(255) not null,
    facility_type varchar(100),
    authority_name varchar(255),
    address varchar(255),
    unit varchar(100),
    postal_code varchar(10),
    municipality_name varchar(255),
    province varchar(2),
    source_id varchar(100),
    min_grade varchar(50),
    max_grade varchar(50),
    language_minority_status boolean default false,
    french_immersion boolean default false,
    early_immersion boolean default false,
    middle_immersion boolean default false,
    late_immersion boolean default false,
    census_subdivision_name varchar(255),
    census_subdivision_id varchar(50),
    geometry varchar(255),
    longitude decimal(10, 7),
    latitude decimal(10, 7),
    date_updated date,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

-- Indexes for common queries
create index idx_facility_type on educational_facility(facility_type);
create index idx_municipality on educational_facility(municipality_name);
create index idx_province on educational_facility(province);
create index idx_authority on educational_facility(authority_name);
