db = db.getSiblingDB('nexon_task');

function getNextSeq(name) {
    return db.counters.findOneAndUpdate({ name: name }, { $inc: { seq: 1 } }, { upsert: true, new: true }).seq;
}

db.users.insertMany([
    {
        user_id: getNextSeq('userCounter'),
        email: 'admin@naver.com',
        password: '$2b$10$jsdpU0KtPKLp/lPfW2dQ5uPK.1Jg9b8fL4Lv/BzZ5Nx2pqIKlyrJm',
        name: '관리자',
        role: 'admin',
        code: '',
    },
    {
        user_id: getNextSeq('userCounter'),
        email: 'auditor@naver.com',
        password: '$2b$10$jsdpU0KtPKLp/lPfW2dQ5uPK.1Jg9b8fL4Lv/BzZ5Nx2pqIKlyrJm',
        name: '에디터',
        role: 'auditor',
        code: '',
    },
    {
        user_id: getNextSeq('userCounter'),
        email: 'operator@naver.com',
        password: '$2b$10$jsdpU0KtPKLp/lPfW2dQ5uPK.1Jg9b8fL4Lv/BzZ5Nx2pqIKlyrJm',
        name: '오퍼레이터',
        role: 'operator',
        code: '',
    },
    {
        user_id: getNextSeq('userCounter'),
        email: 'test@naver.com',
        password: '$2b$10$jsdpU0KtPKLp/lPfW2dQ5uPK.1Jg9b8fL4Lv/BzZ5Nx2pqIKlyrJm',
        name: '테스트',
        role: 'user',
        code: 'AkwoVQH6',
    },
]);
