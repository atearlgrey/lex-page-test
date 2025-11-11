export const featureMatrix = {
  lexGPT: {
    name: 'LexGPT',
    command: 'useLexGPT',
    packages: ['freemium', 'basic', 'pro', 'enterprise'],
  },
  findJudgementInLexGPT: {
    name: 'Find Judgement in LexGPT',
    command: 'useFindJudgementInLexGPT',
    packages: ['pro', 'enterprise'],
  },
  findJudgement: {
    name: 'Find Judgement',
    command: 'useFindJudgement',
    packages: ['basic', 'pro', 'enterprise'],
  },
  draftDocument: {
    name: 'Draft Document',
    command: 'useDraftDocument',
    packages: ['freemium', 'pro', 'enterprise'],
  },
  reviewDocument: {
    name: 'Review Document',
    command: 'useReviewDocument',
    packages: ['freemium', 'pro', 'enterprise'],
  },
};

export const canUseFeature = (pkg, featureKey) => {
  const feature = featureMatrix[featureKey];
  return feature?.packages.includes(pkg);
};
