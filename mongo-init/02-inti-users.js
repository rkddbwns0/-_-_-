db = db.getSiblingDB('nexon_task');

const maxUserIdCount = db.users.find().sort({ user_id: -1 }).limit(1).next();
const maxUserId = maxUserIdCount ? maxUserIdCount.user_id : 0;

console.log('maxUserIdCount', maxUserIdCount);
console.log('maxUserId', maxUserId);

const startUserId = maxUserId;

const inserttData = [
    {
        user_id: startUserId + 1,
        email: 'admin@naver.com',
        password: '$2b$10$jsdpU0KtPKLp/lPfW2dQ5uPK.1Jg9b8fL4Lv/BzZ5Nx2pqIKlyrJm',
        name: '관리자',
        role: 'admin',
        code: '',
    },
    {
        user_id: startUserId + 2,
        email: 'auditor@naver.com',
        password: '$2b$10$jsdpU0KtPKLp/lPfW2dQ5uPK.1Jg9b8fL4Lv/BzZ5Nx2pqIKlyrJm',
        name: '에디터',
        role: 'auditor',
        code: '',
    },
    {
        user_id: startUserId + 3,
        email: 'operator@naver.com',
        password: '$2b$10$jsdpU0KtPKLp/lPfW2dQ5uPK.1Jg9b8fL4Lv/BzZ5Nx2pqIKlyrJm',
        name: '오퍼레이터',
        role: 'operator',
        code: '',
    },
    {
        user_id: startUserId + 4,
        email: 'test@naver.com',
        password: '$2b$10$jsdpU0KtPKLp/lPfW2dQ5uPK.1Jg9b8fL4Lv/BzZ5Nx2pqIKlyrJm',
        name: '테스트',
        role: 'user',
        code: 'AkwoVQH6',
    },
];

db.users.insertMany(inserttData);

console.log('startUserId + inserttData.length', startUserId + inserttData.length);

db.usercounters.updateOne({ _id: 'userCounter' }, { $set: { seq: 4 } }, { upsert: true });
