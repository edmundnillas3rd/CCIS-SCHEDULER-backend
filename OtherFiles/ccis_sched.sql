create database ccis_scheduler;
use ccis_scheduler;
create table students(
	student_id varchar(255) not null,
    students_fullname varchar(255) not null,
    _course varchar(255) not null,
    _year int not null,
	students_email varchar(255) not null unique,
    students_username varchar(255) not null unique,
    students_password varchar(255) not null,
    isActive boolean default false,
    student_image varchar(255) default null,
    subAdmin_Privileges boolean default false,
    isVerified boolean default false,
    primary key(student_id)
);
create table teachers(
	teacher_id varchar(255) not null,
    teachers_fullname varchar(255) not null,
    teachers_email varchar(255) not null unique,
	teachers_username varchar(255) not null unique,
	teachers_password varchar(255) not null,
	isActive boolean default false,
    teacher_image varchar(255) default null,
    primary key(teacher_id)
);
create table venues(
	venue_id varchar(255) not null,
    area varchar(255) not null,
    room varchar(255) not null,
    primary key(venue_id)
);
create table meetings(
	meeting_id varchar(255) not null,
    meeting_code varchar(255)  not null unique,
    meeting_title varchar(255) not null,
    meeting_description varchar(255) not null,
    meeting_date date not null,
    meeting_day char(15) not null,
    time_start time not null,
    time_end time not null,
    venues_id varchar(255) not null,
    student_creator_id varchar(255) null,
    teachers_id varchar(255) default null,
	views boolean default false,
    postponed boolean default false,
    postponed_reason varchar(255) default null,
    number_participants int default null,
	isArchive boolean default false,
    primary key(meeting_id), 
    constraint fk_student_creator_id foreign key(student_creator_id) references students(student_id) on delete cascade on update cascade,
    constraint fk_venue_id foreign key( venues_id) references venues(venue_id) on delete cascade on update cascade,
    constraint fk_teachers_id foreign key(teachers_id) references teachers(teacher_id) on delete cascade on update cascade
);
create index meeting_code_index on meetings(meeting_code);
create table participants(
	participant_id varchar(255) not null,
    access_code varchar(255) not null,
    students_id varchar(255) not null,
    primary key(participant_id),
    constraint fk_students_id foreign  key(students_id) references students(student_id) on delete cascade on update cascade
);
create index access_code_index on participants(access_code);
create table admin_account(
	admin_id int not null auto_increment,
    _fullname varchar(255) default null,	
    _email varchar(255) default null,
    _username varchar(255) default null,
    _password varchar(255) default null,
    primary key(admin_id)
);
