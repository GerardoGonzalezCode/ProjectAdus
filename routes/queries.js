const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5500,
})
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createUser = (request, response) => {
  const { name, email } = request.body

  pool.query('SELECT * FROM users WHERE email = $1', [email], (error, resultsS) => {
    if (error) {
      throw error
    }
    if (resultsS.rows[0] === undefined) {
      pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
        if (error) {
          throw error
        }
        pool.query('SELECT * FROM users WHERE email = $1', [email], (error, resultsUser) => {
          if (error) {
            throw error
          }
          response.status(201).send(`User added with ID: ${resultsUser.rows[0].id}`)
        })
      })
    } else {
      response.status(400).send(`Duplicated User`)
    }
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, resultsS) => {
    if (error) {
      throw error
    }
    if (resultsS.rows[0].email === email) {
      pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
          if (error) {
            throw error
          }
          response.status(200).send(`User modified with ID: ${id}`)
        }
      )
    } else if (resultsS.rows[0].email !== email) {
      pool.query('SELECT * FROM users WHERE email = $1', [email], (error, resultsS) => {
        if (error) {
          throw error
        }
        if (resultsS.rows[0] === undefined) {
          pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3',
            [name, email, id],
            (error, results) => {
              if (error) {
                throw error
              }
              response.status(200).send(`User modified with ID: ${id}`)
            }
          )
        }  else {
          response.status(400).send(`Duplicated User`)
        }
      })
    }
  })
  
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}