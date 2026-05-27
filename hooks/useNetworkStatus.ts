import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

import { useAppDispatch } from '@/store/hooks';
import { setOnline } from '@/store/slices/uiSlice';

/** Mirrors connectivity into Redux so the offline banner can react (criterion 12). */
export function useNetworkStatus() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setOnline(Boolean(state.isConnected)));
    });
    return unsubscribe;
  }, [dispatch]);
}
