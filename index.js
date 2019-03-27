const express = require('express');
const knex = require('knex');
const knexConfig = require('./knexfile').development;

const db = knex(knexConfig);

const server = express();
server.use(express.json());

const cohortsUrl = '/api/cohorts';
const cohortsUrlById = '/api/cohorts/:id';
const studentsUrlByCohortId = '/api/cohorts/:id/students';

const studentsUrl = '/api/students';
const studentsUrlById = '/api/students/:id';

// COHORT ENDPOINTS START HERE

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
        res.status(404).json({
          message: 'there are currently no students enrolled in this course',
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: 'there was an error finding students for the cohort',
      });
    });
});

/*
  [PUT] requires a req.body with fields:
  "id": integer of cohort_id not already listed in the database
  OR "name": "string"
  OR both
  */
server.put(cohortsUrlById, (req, res) => {
  const cohortUpdate = req.body;
  const { id } = req.params;
  if (cohortUpdate.id || cohortUpdate.name) {
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
          .json({ message: 'there was an error updating the cohort' });
      });
  } else {
    res.status(404).json({
      message: 'please include an id or name field with your cohort update',
    });
  }
});

// STUDENT ENDPOINTS START HERE
/*
[POST] requires a req.body with fields:
  "name": "string",
  "cohort_id": integer
*/
server.post(studentsUrl, (req, res) => {
  const entry = req.body;
  if (entry.name && entry.cohort_id) {
    db('students')
      .insert(entry)
      .then(id => {
        res.status(201).json(id);
      })
      .catch(err => {
        res.status(500).json({ message: 'the student could not be added' });
      });
  } else {
    res.status(404).json({
      message: 'please include name and cohort_id fields with your student',
    });
  }
});

/*
[GET] requires nothing
*/
server.get(studentsUrl, (req, res) => {
  db('students')
    .then(students => {
      if (students.length > 0) {
        res.status(200).json(students);
      } else {
        res.status(200).json({
          message: 'the students list is empty, add a cohort to get started',
        });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'the students could not be retrieved' });
    });
});

/*
  [GET] requires an existing id in params
  */
server.get(studentsUrlById, (req, res) => {
  const { id } = req.params;
  db('students')
    .where({ id })
    .then(student => {
      if (student.length > 0) {
        db('cohorts')
          .where({ id: student[0].cohort_id })
          .then(cohortName => {
            delete student[0].cohort_id;
            student[0].cohort = cohortName[0].name;
            res
              .status(200)
              .json(student)
              .catch(err => {
                res
                  .status(500)
                  .json({
                    message:
                      'there was en error retrieving the cohort this student is enrolled in',
                  });
              });
          });
      } else {
        res
          .status(404)
          .json({ message: 'no students exist with the provided id' });
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
server.delete(studentsUrlById, (req, res) => {
  const { id } = req.params;
  db('students')
    .where({ id })
    .del()
    .then(count => {
      if (count) {
        res.status(200).json({ deletedRecords: count });
      } else {
        res
          .status(404)
          .json({ message: 'no students exist with the provided id' });
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'there was an error deleting the cohort' });
    });
});

/*
  [PUT] requires a req.body with fields:
  "id": integer of cohort_id not already listed in the database
  OR "name": "string"
  OR "cohort_id": integer
  OR ALL/AND any combination
  */
server.put(studentsUrlById, (req, res) => {
  const studentUpdate = req.body;
  const { id } = req.params;
  if (studentUpdate.id || studentUpdate.name || studentUpdate.cohort_id) {
    db('students')
      .where({ id })
      .update(studentUpdate)
      .then(count => {
        if (count) {
          res.status(200).json({ updatedRecords: count });
        } else {
          res
            .status(404)
            .json({ message: 'no students exist with the provided id' });
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ message: 'there was an error updating the student' });
      });
  } else {
    res.status(404).json({
      message:
        'please include an id, name, or cohort_id field with your student update',
    });
  }
});

server.listen(8000, () => console.log(`\nrunning on 8000\n`));
