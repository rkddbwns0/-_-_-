db = db.getSiblingDB('nexon_task');

db.roles.insertMany([
    {
        role: 'admin',
        permission: ['create', 'read', 'update', 'delete', 'req', 'res', 'req_log'],
    },
    {
        role: 'operator',
        permission: ['create', 'req_log'],
    },
    {
        role: 'auditor',
        permission: ['read', 'req_log'],
    },
    {
        role: 'user',
        permission: ['req', 'req_log'],
    },
]);
