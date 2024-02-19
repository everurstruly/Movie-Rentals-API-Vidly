module.exports = Object.freeze({
  DATA_PROCESSING_OPTIONS: {
    SORT_ORDERS: {
      ASCENDING: "asc",
      DESCENDING: "desc",
    },
    FILTER_OPERATORS: {
      BITWISE: {
        AND: "$and",
        OR: "$and",
      },
      MEMBERSHIP: {
        in: "$in",
        nin: "$nin",
      },
      COMPARISON: {
        equal: "$eq",
        notEqual: "$ne",
        greaterOrEqual: "$gte",
        lessOrEqual: "$lte",
        greaterThan: "$gt",
        lessThan: "$lt",
      },
    },
  },
  ADMIN: {
    MIN_ROLE_LEVEL_TO_MODIFY_SELF: 20,
    AUTHORIZED_ROLES_BY_TITLE: {
      BOSS_FLOOR_a: ["superadmin"],
      MANAGEMENT_FLOOR_a: ["superadmin", "manager", "supervisor"],
      MANAGEMENT_FLOOR_a1: ["superadmin", "manager"],
      MANAGEMENT_FLOOR_a2: ["superadmin", "supervisor"],
      MANAGEMENT_FLOOR_b: [ "manager", "supervisor"],
      MANAGEMENT_FLOOR_c: ["manager"],
      MANAGEMENT_FLOOR_d: ["supervisor"],
      ROOKIE_FLOOR_a: ["superadmin", "employee"],
      ROOKIE_FLOOR_a1: ["superadmin", "manager", "supervisor", "employee"],
      ROOKIE_FLOOR_b: ["manager", "supervisor", "employee"],
      ROOKIE_FLOOR_c: ["manager", "employee"],
      ROOKIE_FLOOR_d: ["supervisor", "employee"],
      ROOKIE_FLOOR_e: ["employee"],
      LOUNGE_a: ["superadmin", "manager", "supervisor", "employee"],
    },
  },
  MOVIE: {
    RENTAL_CHARGES: {
      anyMovie: {
        rentFee: 12,
        lateFee: 5,
      },
      saleMovie: {
        rentFee: -2,
        lateFee: -2,
      },
      trendyMovie: {
        rentFee: +5,
        lateFee: +2,
      },
      premiumMovie: {
        rentFee: +10,
        lateFee: +5,
      },
      historicalMovie: {
        rentFee: +12,
        lateFee: +1,
      },
    },
  },
});
