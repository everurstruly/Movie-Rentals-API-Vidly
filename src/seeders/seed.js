const { faker } = require("@faker-js/faker");
const Genre = require("./models/genre-model");
const Movie = require("./models/movie-model");
const Role = require("./models/role-model");
const Admin = require("./models/admin-model");
const Membership = require("./models/membership-model");
const User = require("./models/user-model");
const Rental = require("./models/rental-model");
const SessionUser = require("./models/session-user-model");
const SessionAdmin = require("./models/session-admin-model");
const startupDb = require("./startup/database");

// persistant and readily available data for making seeds;
const superAdminSeedSize = 3;
const adminSeedSize = 15;
const userSeedSize = 25;
const rentalSeedSize = 10;

const availableSuperAdminRoleTitle = "superadmin";
const availableRolesTitles = ["manager", "supervisor", "employee"];
const availableMemberships = ["bronze", "silver", "gold", "diamond"];
const availableMovies = [
  {
    title: "Bluey",
    genresTitles: ["comedy", "cartoon", "family"],
  },
  {
    title: "Amazing world of Gumball",
    genresTitles: ["action", "comedy", "cartoon"],
  },
  {
    title: "American Dad",
    genresTitles: ["comedy", "action", "thriller", "romance", "sitcom"],
  },
  {
    title: "Gone Girl",
    genresTitles: ["horror"],
  },
  {
    title: "The Hangover",
    genresTitles: ["action", "comedy"],
  },
  {
    title: "Devils Advocate",
    genresTitles: ["thriller", "drama"],
  },
  {
    title: "Empire",
    genresTitles: ["action", "comedy", "drama", "romance", "thriller"],
  },
];

const availableMovieTitles = availableMovies.map((movie) => movie.title);
const availableGenresTitles = availableMovies.reduce(
  (availableGenres, movie) => {
    movie.genresTitles
      .filter((movieGenre) => !availableGenres.includes(movieGenre))
      .forEach((movieGenre) => {
        availableGenres.push(movieGenre);
      });

    return availableGenres;
  },
  []
);

// factories for making a seeds
const makeGenreSeed = (availableSeedData = {}) => {
  const fakeGenre = faker.helpers.arrayElement(availableGenresTitles);
  return {
    title: fakeGenre,
    ...availableSeedData,
  };
};

const makeMovieSeed = (availableSeedData = {}) => {
  const fakeGenres = faker.helpers.arrayElements(availableGenresTitles);
  return {
    title: faker.company.name(),
    genres: fakeGenres.map((title) => {
      return {
        title,
        _id: faker.database.mongodbObjectId(),
      };
    }),
    numberInStock: faker.datatype.number({ min: 0, max: 100 }),
    dailyRentalRate: faker.datatype.number({ min: 0, max: 100 }),
    audienceMinAge: faker.datatype.number({ min: 1, max: 25 }),
    ...availableSeedData,
  };
};

const makeRoleSeed = (availableSeedData = {}, currSeedIdx) => {
  return {
    title: faker.name.jobTitle(),
    level: (currSeedIdx + 2) * 5,
    ...availableSeedData,
  };
};

const makeAdminSeed = (availableSeedData = {}, currSeedIdx) => {
  const fakeRoles = faker.helpers.arrayElements(availableRolesTitles);
  const sex = faker.name.sexType();
  const firstName = faker.name.firstName(sex);
  const lastName = faker.name.lastName();
  const email = faker.helpers.unique(faker.internet.email, [
    firstName,
    lastName,
  ]);

  return {
    firstName,
    lastName,
    email,
    dateOfBirth: faker.date
      .birthdate({ min: 5, max: 75, mode: "age" })
      .toISOString(),
    password: "adminpassword",
    assignedRoles: fakeRoles.map((title) => {
      return {
        title,
        _id: faker.database.mongodbObjectId(),
      };
    }),
    ...availableSeedData,
  };
};

const makeMembershipSeed = (availableSeedData = {}) => {
  const fakeMembership = faker.helpers.arrayElement(availableMemberships);
  return {
    title: fakeMembership,
    ...availableSeedData,
  };
};

const makeUserSeed = (availableSeedData = {}) => {
  const fakeMemberships = faker.helpers.arrayElements(availableMemberships);
  const sex = faker.name.sexType();
  const firstName = faker.name.firstName(sex);
  const lastName = faker.name.lastName();
  const email = faker.helpers.unique(faker.internet.email, [
    firstName,
    lastName,
  ]);

  return {
    firstName,
    lastName,
    email,
    dateOfBirth: faker.date
      .birthdate({ min: 5, max: 120, mode: "age" })
      .toISOString(),
    password: "userpassword",
    memberships: fakeMemberships.map((title) => {
      return {
        title,
        _id: faker.database.mongodbObjectId(),
      };
    }),
    ...availableSeedData,
  };
};

const makeRentalSeed = (availableSeedData = {}) => {
  const fakeMovieTitles = faker.helpers.arrayElements(availableMovieTitles);
  const adminId = faker.database.mongodbObjectId();
  const adminEmail = faker.internet.email();
  const fakeReturnByAdmin = faker.helpers.arrayElement([adminId, null]);
  const fakeReturnByAt = fakeReturnByAdmin ? new Date().toISOString() : null;

  return {
    user: {
      email: faker.internet.email(),
      _id: faker.database.mongodbObjectId(),
    },
    movies: fakeMovieTitles.map((title) => {
      return {
        title,
        _id: faker.database.mongodbObjectId(),
      };
    }),
    out: {
      byAdmin: {
        email: adminEmail,
        _id: adminId,
      },
    },
    return: {
      at: fakeReturnByAt,
      byAdmin: fakeReturnByAdmin,
    },
    lastModified: {
      byAdmin: {
        email: adminEmail,
        _id: adminId,
      },
    },
    ...availableSeedData,
  };
};

// database seeds
const genreSeeds = availableGenresTitles.map((title) => {
  return makeGenreSeed({ title });
});

const movieSeeds = availableMovies.map(({ title, genresTitles }) => {
  const genres = genresTitles.map((title) => {
    return {
      title,
      _id: faker.database.mongodbObjectId(),
    };
  });

  return makeMovieSeed({ title, genres });
});

const roleSeeds = [...availableRolesTitles, availableSuperAdminRoleTitle].map(
  (title, idx) => {
    return makeRoleSeed({ title }, idx);
  }
);

const adminSeeds = [
  ...new Array(superAdminSeedSize)
    .fill(availableSuperAdminRoleTitle)
    .map((title) => {
      return {
        password: "superadminpassword",
        assignedRoles: [
          {
            title,
            _id: faker.database.mongodbObjectId(),
          },
        ],
      };
    })
    .map((superadminData) => {
      return makeAdminSeed(superadminData);
    }),

  ...new Array(adminSeedSize).fill(0).map((_, idx) => {
    return makeAdminSeed({}, idx);
  }),
];

const membershipSeeds = availableMemberships.map((title) => {
  return makeMembershipSeed({ title });
});

const userSeeds = new Array(userSeedSize).fill(0).map(() => {
  return makeUserSeed();
});

const rentalSeeds = new Array(rentalSeedSize).fill(0).map(() => {
  return makeRentalSeed();
});

// database seeders
const seedGenre = async () => {
  await Genre.deleteMany({});
  for (let seed of genreSeeds) {
    const newGenre = new Genre(seed);
    await newGenre.save();
  }
};

const seedMovie = async () => {
  await Movie.deleteMany({});
  for (let seed of movieSeeds) {
    seed.genres = await seed.genres.reduce(
      async (genres, genreSeed, genreSeedIdx) => {
        const awaitedGenresIds = await genres;
        const genreInDb = await Genre.findOne({ title: genreSeed.title });
        const { _id } = genreInDb || genreSeed;
        awaitedGenresIds[genreSeedIdx] = _id;
        return awaitedGenresIds;
      },
      []
    );

    const newDoc = new Movie(seed);
    await newDoc.save();
  }
};

const seedRole = async () => {
  await Role.deleteMany({});
  for (let seed of roleSeeds) {
    const newRole = new Role(seed);
    await newRole.save();
  }
};

const seedAdmin = async () => {
  await Admin.deleteMany({});
  for (let seed of adminSeeds) {
    seed.assignedRoles = await seed.assignedRoles.reduce(
      async (roles, roleSeed, roleSeedIdx) => {
        const awaitedRolesIds = await roles;
        const roleInDb = await Role.findOne({ title: roleSeed.title });
        const { _id } = roleInDb || roleSeed;
        awaitedRolesIds[roleSeedIdx] = _id;
        return awaitedRolesIds;
      },
      []
    );

    const newDoc = new Admin(seed);
    await newDoc.save();
  }
};

const seedMembership = async () => {
  await Membership.deleteMany({});
  for (let seed of membershipSeeds) {
    const newMembership = new Membership(seed);
    await newMembership.save();
  }
};

const seedUser = async () => {
  await User.deleteMany({});
  for (let seed of userSeeds) {
    seed.memberships = await seed.memberships.reduce(
      async (memberships, membershipSeed, membershipSeedIdx) => {
        const awaitedMembershipsIds = await memberships;
        const membershipInDb = await Membership.findOne({
          title: membershipSeed.title,
        });

        const { _id } = membershipInDb || membershipSeed;
        awaitedMembershipsIds[membershipSeedIdx] = _id;
        return awaitedMembershipsIds;
      },
      []
    );

    const newDoc = new User(seed);
    await newDoc.save();
  }
};

const seedRental = async () => {
  await Rental.deleteMany({});
  for (let seed of rentalSeeds) {
    seed.user = await (async function () {
      const seedUser = seed.user;
      const userInDb = await User.findOne({ email: seedUser.email });
      const { _id } = userInDb || seedUser;
      return _id;
    })();

    seed.movies = await seed.movies.reduce(
      async (movies, movieSeed, movieSeedIdx) => {
        const awaitedMoviesIds = await movies;
        const movieInDb = await Movie.findOne({ title: movieSeed.title });
        const { _id } = movieInDb || movieSeed;
        awaitedMoviesIds[movieSeedIdx] = _id;
        return awaitedMoviesIds;
      },
      []
    );

    seed.lastModified.byAdmin = await (async function () {
      const seedLastModifiedByAdmin = seed.out.byAdmin;
      const adminInDb = await Admin.findOne({
        email: seedLastModifiedByAdmin.email,
      });

      const { _id } = adminInDb || seedLastModifiedByAdmin;
      return _id;
    })();

    // seed.return.byAdmin = await (async function () {
    //   const seedReturnByAdmin = seed.out.byAdmin;
    //   const adminInDb = await Admin.findOne({ email: seedReturnByAdmin.email });
    //   const { _id } = adminInDb || seedReturnByAdmin;
    //   return _id;
    // })();

    seed.out.byAdmin = await (async function () {
      const seedOutByAdmin = seed.out.byAdmin;
      const adminInDb = await Admin.findOne({ email: seedOutByAdmin.email });
      const { _id } = adminInDb || seedOutByAdmin;
      return _id;
    })();

    const newDoc = new Rental(seed);
    await newDoc.save();
  }
};

const seedSessionUser = async () => {
  await SessionUser.deleteMany({});
};

const seedSessionAdmin = async () => {
  await SessionAdmin.deleteMany({});
};

const seedDb = async () => {
  console.log("* Starting seeding process...");
  try {
    const dbConnection = await startupDb();
    console.log("* Connected to DB!");
    await seedGenre();
    await seedMovie();
    await seedRole();
    await seedAdmin();
    await seedMembership();
    await seedUser();
    await seedRental();
    await seedSessionUser();
    await seedSessionAdmin();
    await dbConnection.disconnect();
    console.log("* Done! seeding database");
  } catch (error) {
    console.log("error (seeding-db) -", error.name, error.message);
  }
};

seedDb();
