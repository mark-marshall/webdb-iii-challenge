
exports.seed = function(knex, Promise) {
  return knex('cohorts').del()
    .then(function () {
      return knex('cohorts').insert([
        {name: 'WEBEU1'},
        {name: 'WEBEU2'},
        {name: 'WEBEU3'}
      ]);
    });
};
