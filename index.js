const express = require('express');
const knex = require('knex');
const knexConfig = require('./knexfile').development;

const db = knex(knexConfig);

const server = express();
server.use(express.json());

const cohortsUrl = '/api/cohorts';
const cohortsUrlById = '/api/cohorts/:id';
const studentsUrlByCohortId = '/api/cohorts/:id/students';

/*
[POST] requires a req.body with fields:
  "name": "string"
*/
server.post(cohortsUrl, (req, res) => {
  const entry = req.body;
  if (entry.name) {
    db('cohorts')
      .insert(entry)
      .then(id => {
        res.status(201).json(id);
      })
      .catch(err => {
        res.status(500).json({ message: 'the cohort could not be added' });
      });
  } else {
    res
      .status(404)
      .json({ message: 'please include a name field with your cohort' });
  }
});

/*
[GET] requires nothing
*/
server.get(cohortsUrl, (req, res) => {
  db('cohorts')
    .then(cohorts => {
      if (cohorts.length > 0) {
        res.status(200).json(cohorts);
      } else {
        res.status(200).json({
          message: 'the cohorts list is empty, add a cohort to get started',
        });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'the cohorts could not be retrieved' });
    });
});

/*
[GET] requires an existing id in params
*/
server.get(cohortsUrlById, (req, res) => {
  const { id } = req.params;
  db('cohorts')
    .where({ id })
    .then(cohort => {
      if (cohort.length > 0) {
        res.status(200).json(cohort);
      } else {
        res
          .status(404)
          .json({ message: 'no cohorts exist with the provided id' });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'there was an error finding the cohort' });
    });
});

/*
[DELETE] requires an existing id in params
*/
server.delete(cohortsUrlById, (req, res) => {
  const { id } = req.params;
  db('cohorts')
    .where({ id })
    .del()
    .then(count => {
      if (count) {
        res.status(200).json({ deletedRecords: count });
      } else {
        res
          .status(404)
          .json({ message: 'no cohorts exist with the provided id' });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'there was an error deleting the cohort' });
    });
});

/*
[GET] requires an existing cohort id in params
*/
server.get(studentsUrlByCohortId, (req, res) => {
  const { id } = req.params;
  db('students')
    .where({ cohort_id: id })
    .then(students => {
      if (students.length > 0) {
        res.status(200).json(students);
      } else {
        res
          .status(404)
          .json({
            message: 'there are currently no students enrolled in this course',
          });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({
          message: 'there was an error finding students for the cohort',
        });
    });
});

/*
  [PUT] requires a req.body with fields:
  "id": integer of cohort_id not already listed in the databse
  */
server.put(cohortsUrlById, (req, res) => {
  const cohortUpdate = req.body;
  const { id } = req.params;
  if (id) {
    db('cohorts')
      .where({ id })
      .update(cohortUpdate)
      .then(count => {
        if (count) {
          res.status(200).json({ updatedRecords: count });
        } else {
          res
            .status(404)
            .json({ message: 'no cohorts exist with the provided id' });
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ message: 'there was an error updating the id of th cohort' });
      });
  } else {
    res
      .status(404)
      .json({ message: 'please include an id field with your cohort update' });
  }
});

server.listen(8000, () => console.log(`\nrunning on 8000\n`));
