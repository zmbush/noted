// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
import { createSelector } from 'reselect';

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Alert, Snackbar } from '@mui/material';

import { AppState } from 'features/redux/store';

import { ErrorData } from 'data/types';

import { clearLastError, prefix, ErrorState } from './slice';

const getErrorState = (state: AppState): ErrorState => state[prefix];
const sliceSelector = (_: AppState, { slice }: { slice: keyof ErrorState } = { slice: 'any' }) =>
  slice;
const getLastError = createSelector(getErrorState, sliceSelector, (errors, slice) => errors[slice]);

const formatErr = (e: ErrorData) => e.message;

const ErrorManager = () => {
  const [errors, setErrors] = React.useState(new Set<ErrorData>());
  const lastError = useSelector(getLastError);
  const dispatch = useDispatch();

  if (lastError != null) {
    setErrors(new Set([...errors, lastError]));
    dispatch(clearLastError());
  }

  const close = React.useCallback(
    (e) => {
      const newErrors = new Set([...errors]);
      newErrors.delete(e);
      setErrors(newErrors);
    },
    [errors],
  );

  return (
    <>
      {[...errors].map((e) => (
        <Snackbar key={JSON.stringify(e)} open autoHideDuration={6000} onClose={() => close(e)}>
          <Alert onClose={() => close(e)} severity='error' sx={{ width: '100%' }}>
            {formatErr(e)}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ErrorManager;
