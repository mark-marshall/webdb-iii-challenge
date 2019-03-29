
exports.seed = function(knex, Promise) {
  return knex('students').del()
    .then(function () {
      return knex('students').insert([
        {name: 'luke', cohort_id: 1},
        {name: 'orlando', cohort_id: 1},
        {name: 'samar', cohort_id: 3}
      ]);
    });
};
