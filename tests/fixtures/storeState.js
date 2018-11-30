import { MODE_PREPARE, MODE_INIT_SELF } from '../../src';

export const modePrepareAndNothingPrepared = {
  init: {
    mode: MODE_PREPARE,
    prepared: {},
    selfInit: {},
  },
};

export const modePrepareAndSimplePreparedNoProps = {
  init: {
    mode: MODE_PREPARE,
    prepared: {
      'SimpleInitTestComponent[]': true,
    },
    selfInit: {},
  },
};

export const modePrepareAndSimplePreparePendingNoProps = {
  init: {
    mode: MODE_PREPARE,
    prepared: {
      'SimpleInitTestComponent[]': false,
    },
    selfInit: {},
  },
};

export const modeInitSelfAndNothingPrepared = {
  init: {
    mode: MODE_INIT_SELF,
    prepared: {},
    selfInit: {},
  },
};

export const modeInitSelfAndSimplePreparedNoProps = {
  init: {
    mode: MODE_INIT_SELF,
    prepared: {
      'SimpleInitTestComponent[]': true,
    },
    selfInit: {},
  },
};

export const modeInitSelfAndSimplePreparedReinitializingNoProps = {
  init: {
    mode: MODE_INIT_SELF,
    prepared: {
      'SimpleInitTestComponent[]': true,
    },
    selfInit: {
      'SimpleInitTestComponent[]': false,
    },
  },
};

export const modeInitSelfAndSimplePreparedReinitializedNoProps = {
  init: {
    mode: MODE_INIT_SELF,
    prepared: {
      'SimpleInitTestComponent[]': true,
    },
    selfInit: {
      'SimpleInitTestComponent[]': true,
    },
  },
};
