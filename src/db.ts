export function test() {
    const mysql = require('mysql2');
    const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: '',
    password: ''
    });
    connection.query(
        'SELECT `TABLE_NAME` FROM `INFORMATION_SCHEMA`.`TABLES` WHERE `TABLE_SCHEMA` = ?',
        [connection.config.database],
        function (err, tables) {
            if (err) {
                console.error(err);
                return connection.end(); 
            }

            let processedTables = 0;
            const tableStructures = [];

            tables.forEach((table) => {
                const tableName = table['TABLE_NAME'];
                const tableObj = {
                    tableName: tableName,
                    columns: [],
                    foreignKeys: []
                };

                connection.query(
                    'SELECT `COLUMN_NAME`, `DATA_TYPE` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA` = ? AND `TABLE_NAME` = ?',
                    [connection.config.database, tableName],
                    function (err, columns) {
                        if (err) {
                            console.error(err);
                            return connection.end(); 
                        }

                        columns.forEach(column => {
                            tableObj.columns.push({ columnName: column['COLUMN_NAME'], dataType: column['DATA_TYPE'] });
                        });

                        connection.query(
                            `SELECT kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME 
                             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc 
                             JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu 
                             ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME 
                             AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA 
                             AND tc.TABLE_NAME = kcu.TABLE_NAME 
                             WHERE tc.CONSTRAINT_TYPE = 'FOREIGN KEY' 
                             AND tc.TABLE_SCHEMA = ? 
                             AND tc.TABLE_NAME = ?`,
                            [connection.config.database, tableName],
                            function (err, foreignKeys) {
                                if (err) {
                                    console.error(err);
                                    return connection.end(); 
                                }

                                foreignKeys.forEach(fk => {
                                    tableObj.foreignKeys.push({
                                        columnName: fk['COLUMN_NAME'],
                                        referencedTableName: fk['REFERENCED_TABLE_NAME'],
                                        referencedColumnName: fk['REFERENCED_COLUMN_NAME']
                                    });
                                });

                                tableStructures.push(tableObj);

                                processedTables++;
                                if (processedTables === tables.length) {
                                    console.log(JSON.stringify(tableStructures, undefined, 4));
                                    connection.end(); 
                                }
                            }
                        );
                    }
                );
            });
        }
    );    
 }
