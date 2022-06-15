import {
  Commit,
  DeploymentState,
} from '../app/commits-dashboard/commits-dashboard-models';

export const getCommitMock = (): Commit => ({
  parents: ['bdec152e01968b414e84841e1c0484e3c1df7e31'],
  commitUrl:
    'https://github.com/organisation/repository-name/commit/d819c2b5b727d6a111c19cfb873be8d89cb1683e',
  committedDate: new Date('2022-05-11T09:41:20Z'),
  id: 'C_kwDODZveWNoAKGQ4MTljMmI1YjcyN2Q2YTExMWMxOWNmYjg3M2JlOGQ4OWNiMTY4M2U',
  oid: 'd819c2b5b727d6a111c19cfb873be8d89cb1683e',
  abbreviatedOid: 'd819c2b',
  message:
    'Merge pull request #1 from organisation/feature/MD-1234 commit for testing everything\n\nfeat(test): add new feature to test the commit and its message',
  author: {
    name: 'testuser',
    login: 'testuser',
  },
  committer: {
    name: 'GitHub',
    email: 'noreply@github.com',
  },
  deployments: [
    {
      id: 'DE_kwDODZveWM4hgng-',
      environment: 'dev',
      timestamp: new Date('2022-05-11T09:46:47Z'),
      creator: {
        login: 'testuser',
        name: '',
      },
      state: DeploymentState.INACTIVE,
    },
  ],
  isMergeCommit: true,
});
