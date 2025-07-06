# hotel

add hotel detail
than add room detail(with room type)
room avilablity with bed type
add meal plan( which plane will available at this room)
extra person pricing (adult and child)
pricing
add minimun accomodation(3) max can be 2 with child or 1 with adult

Table hotels {
  id integer [primary key]
  name varchar
  full_address text
  city varchar
  map_link text
  main_image varchar
  images text
  about text
  status integer [note: '0 = inactive, 1 = coming soon, 2 = functional']
  created_at timestamp
  updated_at timestamp
  type varchar [note: 'hotel, resort, sp, plr']
}

Table hotel_rooms {
  id integer [primary key]
  hotel_id integer
  main_image varchar
  images text
  room_type_id integer 
  room_size varchar
  accommodation text
  description text
  price decimal
  created_at timestamp
  updated_at timestamp
}

Table meal_plans {
  id integer [primary key]
  plan_name varchar
  description text
  created_at timestamp
  updated_at timestamp
}

Table pricing {
  pricing_id integer [primary key]
  room_id integer
  plan_id integer 
  num_persons integer
  base_price decimal
  tax_percentage decimal
}

Table extra_person_pricing {
  id integer [primary key]
  room_id integer 
  plan_id integer 
  age_group varchar
  extra_person_price decimal
  tax_percentage decimal
  created_at timestamp
  updated_at timestamp
}

Table room_types {
  id integer [primary key]
  room_name varchar
}

Table room_availability {
  id integer [primary key]
  room_id integer
  bed_type varchar
  available_rooms integer
  booked_rooms integer
  created_at timestamp
  updated_at timestamp
}

// Relationships
Ref: hotel_rooms.room_type_id > room_types.id
Ref: pricing.room_id > hotel_rooms.id
Ref: pricing.plan_id > meal_plans.id
Ref: extra_person_pricing.room_id > hotel_rooms.id
Ref: extra_person_pricing.plan_id > meal_plans.id
Ref: room_availability.room_id > hotel_rooms.id
Ref: hotel_rooms.hotel_id > hotels.id


booking child,and adult part need to be corrected (),
show the discount
correcct multiple booking making 
on front page after getting true only than return to booking page

case
1 adult 1 children 1 r

case
1 a 2 c 1 r
working
1a 2c 2r (error shown)

case 
2 adult 2 child 1room 
working
2a 2c 2r (working but not correctly(but children are seprate showing))
3a 2c 1r(error)
3a 2c 2r(working but children are seprate showing)
3a 2c 3r(incorectly putting adult and childrens)