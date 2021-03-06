const mysql = require('mysql');

// Connection string parameters.
const pool = mysql.createPool({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE,
  port : process.env.DB_PORT,
  connectionLimit : 65,
  queueLimit : 5000
});

// Ouvre une connection et démarre la transaction
const getConnectionForTransaction = (pool) => {
  return new Promise((resolve,reject)=>{
    pool.getConnection((error,connection)=>{
      if(error){
        reject(error);
      }
      else{
        connection.beginTransaction(function(err) {
          if (err) { return reject(error);}
          console.log("Transaction successfully openened");
          resolve(connection);
        });
      }
    });
  });
}

// Termine la transaction et ferme la connection
const closeConnectionTransaction = (connection) => {
  connection.commit(function(err) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }
    connection.release();
    console.log('Connection closed');
  });
}

// Termine la transaction et ferme la connection
const rollbackConnectionTransaction = (connection) => {
  return new Promise((resolve) => {
    connection.rollback(()=>{
      connection.release();
      resolve();
    });
    console.log('Connection has been rollbacked');
  });
}

exports.getConnectionForTransaction = getConnectionForTransaction;
exports.closeConnectionTransaction = closeConnectionTransaction;
exports.rollbackConnectionTransaction = rollbackConnectionTransaction;
exports.pool = pool;
